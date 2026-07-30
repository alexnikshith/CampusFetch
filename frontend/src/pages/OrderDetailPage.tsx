import React, { useState, useEffect } from 'react';
import { ArrowLeft, MessageSquare, CheckCircle, Clock, Upload, ShieldCheck, Phone, AlertCircle, Send, Key, UserCheck, Sparkles, Navigation, ExternalLink } from 'lucide-react';
import { Order, ChatMessage } from '../types';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

interface OrderDetailPageProps {
  orderId: string;
  onBack: () => void;
}

export const OrderDetailPage: React.FC<OrderDetailPageProps> = ({ orderId, onBack }) => {
  const { user } = useAuth();
  const { socket, showToast } = useSocket();

  const [order, setOrder] = useState<Order | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [showChatDrawer, setShowChatDrawer] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const fetchOrderDetail = async () => {
    try {
      const res = await api.get(`/orders/${orderId}`);
      if (res.data.success) {
        setOrder(res.data.order);
        setMessages(res.data.order.messages || []);
      }
    } catch (err) {
      console.error('Failed to fetch order detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetail();

    if (socket && orderId) {
      socket.emit('join_order_room', orderId);

      const handleReceiveChat = (newMsg: ChatMessage) => {
        setMessages((prev) => {
          const exists = prev.some(
            (m) =>
              m.id === newMsg.id ||
              (m.senderId === newMsg.senderId &&
                m.message === newMsg.message &&
                Math.abs(new Date(m.createdAt).getTime() - new Date(newMsg.createdAt).getTime()) < 3000)
          );
          if (exists) return prev;
          return [...prev, newMsg];
        });
      };

      const handleOrderUpdated = (updatedOrder: Order) => {
        setOrder(updatedOrder);
        if (updatedOrder.messages) {
          setMessages(updatedOrder.messages);
        }
      };

      socket.on('receive_chat_message', handleReceiveChat);
      socket.on('order_updated', handleOrderUpdated);

      return () => {
        socket.off('receive_chat_message', handleReceiveChat);
        socket.off('order_updated', handleOrderUpdated);
        socket.emit('leave_order_room', orderId);
      };
    }
  }, [orderId, socket]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const msg = chatInput.trim();
    setChatInput('');

    try {
      const res = await api.post('/chat', { orderId, message: msg });
      if (res.data.success) {
        const dbMessage = res.data.message;

        setMessages((prev) => {
          if (prev.some((m) => m.id === dbMessage.id)) return prev;
          return [...prev, dbMessage];
        });

        if (socket) {
          socket.emit('send_chat_message', {
            id: dbMessage.id,
            orderId,
            senderId: user?.id,
            receiverId: order?.customerId === user?.id ? order?.runnerId : order?.customerId,
            message: msg,
            senderName: user?.fullName,
            createdAt: dbMessage.createdAt || new Date().toISOString(),
          });
        }
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      const res = await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      if (res.data.success) {
        setOrder(res.data.order);
        showToast('Order Status Updated', `Status changed to ${newStatus}`, 'success');
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update status');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpInput) return;
    setVerifyingOtp(true);

    try {
      const res = await api.post(`/orders/${orderId}/verify-otp`, { otp: otpInput });
      if (res.data.success) {
        setOrder(res.data.order);
        showToast('🎉 Delivery Verified!', 'Delivery confirmed with customer OTP!', 'success');
        setOtpInput('');
      } else {
        alert(res.data.error || 'Incorrect delivery OTP');
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to verify delivery OTP');
    } finally {
      setVerifyingOtp(false);
    }
  };

  if (loading || !order) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 text-xs text-slate-500">
        Loading order detail...
      </div>
    );
  }

  const isCustomer = user?.id === order.customerId;
  const isRunner = user?.id === order.runnerId;

  const steps = ['PENDING', 'ACCEPTED', 'SHOPPING', 'ON_THE_WAY', 'DELIVERED'];
  const currentStepIdx = steps.indexOf(order.status);

  const parsedItems = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20 bg-slate-50 relative">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-xl bg-white border border-slate-300 flex items-center justify-center text-slate-700 hover:text-[#8c182b] shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base font-black text-[#8c182b]">Order #{order.orderNumber}</h2>
            <p className="text-xs text-slate-600 font-bold">{order.store.name} • {order.store.location}</p>
          </div>
        </div>

        <button
          onClick={() => setShowChatDrawer(!showChatDrawer)}
          className="flex items-center gap-1.5 bg-[#8c182b] hover:bg-[#731222] text-white px-3 py-1.5 rounded-xl text-xs font-extrabold shadow-md"
        >
          <MessageSquare className="w-4 h-4" />
          <span>In-App Chat ({messages.length})</span>
        </button>
      </div>

      {/* Visual Progress Stepper */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 space-y-3 shadow-sm">
        <h3 className="text-xs font-black text-[#8c182b] uppercase tracking-wider">
          Delivery Progress Stepper
        </h3>

        <div className="flex items-center justify-between relative px-2">
          {steps.map((step, idx) => {
            const isDone = idx <= currentStepIdx;
            const isCurrent = idx === currentStepIdx;

            return (
              <div key={step} className="flex flex-col items-center z-10">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                    isCurrent
                      ? 'bg-[#8c182b] text-white ring-4 ring-rose-200 scale-110 shadow-md'
                      : isDone
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isDone ? '✓' : idx + 1}
                </div>
                <span className={`text-[9px] font-bold mt-1 ${isCurrent ? 'text-[#8c182b]' : isDone ? 'text-emerald-700' : 'text-slate-400'}`}>
                  {step.replace(/_/g, ' ')}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* PROMINENT ASSIGNED STUDENT RUNNER DETAILS CARD */}
      {order.runner ? (
        <div className="bg-white border-2 border-[#8c182b] rounded-3xl p-4 shadow-md space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-rose-100 pb-2.5">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[#8c182b]" />
              <h3 className="text-xs font-black text-[#8c182b] uppercase tracking-wider">
                Assigned Student Runner Details
              </h3>
            </div>
            <span className="bg-emerald-50 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Trust {order.runner.trustScore || 96}%
            </span>
          </div>

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#8c182b] text-white p-0.5 shadow-md">
                <div className="w-full h-full rounded-2xl bg-white flex items-center justify-center font-black text-[#8c182b] text-base overflow-hidden border border-slate-200">
                  {order.runner.profilePic ? (
                    <img src={order.runner.profilePic} alt={order.runner.fullName} className="w-full h-full object-cover" />
                  ) : (
                    order.runner.fullName.charAt(0)
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                  {order.runner.fullName}
                  <span className="text-[10px] text-[#8c182b] font-bold">(@{order.runner.username})</span>
                </h4>
                <p className="text-[11px] text-slate-600 font-semibold mt-0.5">
                  {order.runner.department} • {order.runner.year}
                </p>
                <p className="text-[11px] text-[#8c182b] font-extrabold mt-0.5">
                  Hostel: {order.runner.hostel} (Room {order.runner.roomNumber})
                </p>
              </div>
            </div>
          </div>

          {/* Contact Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <a
              href={`tel:${order.runner.phone}`}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call ({order.runner.phone})</span>
            </a>

            <button
              onClick={() => setShowChatDrawer(true)}
              className="bg-[#8c182b] hover:bg-[#731222] text-white font-black py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>In-App Chat</span>
            </button>
          </div>
        </div>
      ) : (
        /* Waiting for Runner Card */
        <div className="bg-white border border-slate-200 rounded-3xl p-4 text-center space-y-2 shadow-sm">
          <Clock className="w-6 h-6 text-[#8c182b] mx-auto animate-spin" />
          <h4 className="font-black text-xs text-[#8c182b]">Finding a Student Runner...</h4>
          <p className="text-[11px] text-slate-600 font-medium">
            Your request is visible to students visiting {order.store.name}. You will be notified instantly when accepted!
          </p>
        </div>
      )}

      {/* Customer Info Card (Shown when order is viewed by Runner) */}
      {isRunner && (
        <div className="bg-white border border-slate-200 rounded-3xl p-4 space-y-2 shadow-sm">
          <h3 className="text-xs font-black text-[#8c182b] uppercase tracking-wider flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-[#8c182b]" /> Customer Delivery Details
          </h3>
          <div className="flex items-center justify-between text-xs bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <div>
              <p className="font-extrabold text-slate-900">{order.customer.fullName}</p>
              <p className="text-[11px] text-[#8c182b] font-bold">
                {order.customer.hostel} • Room {order.customer.roomNumber}
              </p>
              <p className="text-[10px] text-slate-500 font-medium">{order.customer.department} ({order.customer.year})</p>
            </div>
            <a
              href={`tel:${order.customer.phone}`}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-sm"
            >
              <Phone className="w-3.5 h-3.5" /> Call ({order.customer.phone})
            </a>
          </div>
        </div>
      )}

      {/* Delivery OTP Security Verification Section */}
      <div className="bg-white border border-rose-200 rounded-3xl p-4 space-y-2 shadow-sm">
        <div className="flex items-center gap-2">
          <Key className="w-5 h-5 text-[#8c182b]" />
          <h3 className="text-xs font-black text-[#8c182b]">4-Digit Delivery Confirmation OTP</h3>
        </div>

        {isCustomer ? (
          <div className="bg-rose-50 border border-rose-200 p-3 rounded-2xl text-center space-y-1">
            <p className="text-xs text-slate-700 font-medium">
              Share this secret OTP with your runner when they hand over your items:
            </p>
            <div className="text-2xl font-black tracking-[8px] text-[#8c182b] bg-white py-2 rounded-xl inline-block px-6 border border-[#8c182b] shadow-sm">
              {order.deliveryOtp}
            </div>
          </div>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-2">
            <p className="text-[11px] text-slate-700 font-medium">
              Ask customer for their 4-digit Delivery OTP upon handing over the order:
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={4}
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                placeholder="Enter 4-digit OTP"
                className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 text-center font-bold tracking-widest focus:outline-none focus:border-[#8c182b]"
              />
              <button
                type="submit"
                disabled={verifyingOtp || order.status === 'DELIVERED'}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-1 shadow-sm"
              >
                {verifyingOtp ? 'Verifying...' : 'Confirm Delivery Completion ✓'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Runner Workflow Control Bar */}
      {isRunner && order.status !== 'DELIVERED' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-3 flex flex-wrap gap-2 shadow-sm">
          <span className="w-full text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Runner Status Actions:
          </span>
          <button
            onClick={() => handleUpdateStatus('SHOPPING')}
            className="flex-1 bg-[#8c182b] hover:bg-[#731222] text-white font-bold py-2 rounded-xl text-xs shadow-sm"
          >
            Set "Shopping" 🛍️
          </button>
          <button
            onClick={() => handleUpdateStatus('ON_THE_WAY')}
            className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-2 rounded-xl text-xs shadow-sm"
          >
            Set "On The Way" 🛵
          </button>
        </div>
      )}

      {/* Order Summary & Items Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 space-y-3 shadow-sm">
        <h3 className="text-xs font-black text-[#8c182b] uppercase tracking-wider">
          Requested Items & Notes
        </h3>

        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs space-y-1.5">
          {Array.isArray(parsedItems) ? (
            parsedItems.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between text-slate-800 font-medium">
                <span>• {item.name} (x{item.quantity})</span>
                <span className="font-bold text-[#8c182b]">~₹{item.approxPrice * item.quantity}</span>
              </div>
            ))
          ) : (
            <p className="text-slate-800">{order.items}</p>
          )}

          {order.notes && (
            <div className="mt-2 pt-2 border-t border-slate-200 text-[11px] text-[#8c182b] italic font-semibold">
              "Notes: {order.notes}"
            </div>
          )}
        </div>

        {/* Pricing Summary */}
        <div className="bg-slate-50 p-3 rounded-2xl text-xs space-y-1.5 border border-slate-200">
          <div className="flex justify-between text-slate-600">
            <span>Items Approx Cost:</span>
            <span className="text-slate-900 font-bold">₹{order.estimatedCost}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Delivery Fee:</span>
            <span className="text-emerald-700 font-bold">₹{order.deliveryFee}</span>
          </div>
          <div className="flex justify-between text-slate-900 font-black text-sm pt-1 border-t border-slate-200">
            <span>Total Payable ({order.paymentMethod}):</span>
            <span className="text-[#8c182b]">₹{(order.estimatedCost + order.deliveryFee).toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Realtime Socket Chat Drawer */}
      {showChatDrawer && (
        <div className="fixed inset-x-0 bottom-0 h-[450px] bg-white border-t-2 border-[#8c182b] rounded-t-3xl shadow-2xl z-40 flex flex-col p-4 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
            <h3 className="font-extrabold text-sm text-[#8c182b] flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#8c182b]" /> Realtime Order Chat
            </h3>
            <button
              onClick={() => setShowChatDrawer(false)}
              className="text-slate-500 hover:text-slate-900 text-xs font-bold"
            >
              Close ✕
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto space-y-2.5 p-1 bg-slate-50 rounded-2xl mb-2 border border-slate-200">
            {messages.map((m, idx) => {
              const isMe = m.senderId === user?.id;
              return (
                <div
                  key={m.id || idx}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[9px] text-slate-500 font-bold mb-0.5 px-1">
                    {m.sender?.fullName || 'Student'}
                  </span>
                  <div
                    className={`max-w-[80%] p-2.5 rounded-2xl text-xs font-bold shadow-sm ${
                      isMe
                        ? 'bg-[#8c182b] text-white rounded-tr-none'
                        : 'bg-white text-slate-900 border border-slate-300 rounded-tl-none'
                    }`}
                  >
                    {m.message}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chat input form */}
          <form onSubmit={handleSendMessage} className="flex gap-2 pt-1">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type message to runner/customer..."
              className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#8c182b]"
            />
            <button
              type="submit"
              className="bg-[#8c182b] hover:bg-[#731222] text-white font-bold px-3 py-2 rounded-xl text-xs flex items-center justify-center shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
