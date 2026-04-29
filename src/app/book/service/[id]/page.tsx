"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { apiClient } from "@/infrastructure/api/clients/api-client";
import { useAuth } from "@/core/store/auth-context";
import { format } from "date-fns";
import Image from "next/image";
import {
  ArrowLeft, Star, Clock, MapPin, Users, CreditCard, Lock,
  CheckCircle2, AlertCircle, Loader2, X, ChevronDown, ChevronUp,
  Shield, Phone, Mail, User, LogIn,
} from "lucide-react";

/* ─── helpers ──────────────────────────────────────────────── */
function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

/* ─── Razorpay modal ────────────────────────────────────────── */
function RazorpayModal({ isOpen, onClose, amount, user, onSuccess, serviceId }: {
  isOpen: boolean; onClose: () => void; amount: number;
  user: any; onSuccess: (pd: any) => Promise<void>;
  serviceId?: string;
}) {
  const [step, setStep] = useState<"init" | "processing" | "success" | "error">("init");
  const [err, setErr] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { if (isOpen) { setStep("init"); setErr(""); } }, [isOpen]);

  useEffect(() => {
    if (!isOpen || loaded) return;
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    s.onload = () => setLoaded(true);
    s.onerror = () => setErr("Failed to load Razorpay — please refresh.");
    document.body.appendChild(s);
  }, [isOpen, loaded]);

  const pay = async () => {
    setStep("processing");
    try {
      const orderRes: any = await apiClient.createRazorpayOrder(null, amount, "INR", serviceId, undefined, true);
      if (!orderRes.success) throw new Error(orderRes.error || "Order creation failed");
      const { orderId, key } = orderRes.data;
      if (!(window as any).Razorpay) throw new Error("Razorpay not loaded");
      const rp = new (window as any).Razorpay({
        key, amount: Math.round(amount * 100), currency: "INR",
        name: "TripMe", description: "Service Booking", order_id: orderId,
        prefill: { name: user?.name || "", email: user?.email || "", contact: user?.phone || "" },
        theme: { color: "#7C3AED" },
        handler: async (res: any) => {
          setStep("processing");
          try {
            await onSuccess({ razorpayOrderId: res.razorpay_order_id, razorpayPaymentId: res.razorpay_payment_id, razorpaySignature: res.razorpay_signature, razorpayPaymentDetails: res });
            setStep("success");
          } catch (e: any) { setErr(e?.message || "Booking failed after payment."); setStep("error"); }
        },
        modal: { ondismiss: () => setStep("init") },
      });
      rp.on("payment.failed", (r: any) => { setErr(r.error?.description || "Payment failed"); setStep("error"); });
      rp.open();
    } catch (e: any) { setErr(e?.message || "Payment failed"); setStep("error"); }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-2xl flex items-center justify-center"><CreditCard className="w-5 h-5 text-white" /></div>
            <div><h2 className="text-xl font-bold">Complete Payment</h2><p className="text-sm text-gray-500">Secured by Razorpay</p></div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X size={18} /></button>
        </div>
        <div className="p-6">
          {step === "init" && (
            <div className="space-y-5">
              <div className="text-center p-5 bg-purple-50 rounded-2xl">
                <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                <p className="text-4xl font-black text-purple-700">{fmt(amount)}</p>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl text-sm text-gray-600"><Lock size={16} /> SSL encrypted · 100% secure</div>
              {err && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl">{err}</p>}
              <button onClick={pay} disabled={!loaded} className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg rounded-2xl transition disabled:opacity-50 flex items-center justify-center gap-2">
                <CreditCard size={20} />{!loaded ? "Loading…" : `Pay ${fmt(amount)}`}
              </button>
            </div>
          )}
          {step === "processing" && (
            <div className="text-center py-14">
              <Loader2 size={40} className="animate-spin mx-auto mb-4 text-purple-500" />
              <p className="font-semibold text-lg">Processing…</p>
              <p className="text-sm text-gray-500 mt-1">Please wait, do not close this window.</p>
            </div>
          )}
          {step === "success" && (
            <div className="text-center py-14">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle2 size={32} className="text-green-600" /></div>
              <p className="font-bold text-xl">Booking Confirmed!</p>
              <p className="text-gray-500 text-sm mt-1">Redirecting to your bookings…</p>
            </div>
          )}
          {step === "error" && (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto"><AlertCircle size={28} className="text-red-600" /></div>
              <p className="font-bold text-xl">Something Went Wrong</p>
              <p className="text-sm text-gray-500">{err}</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => { setStep("init"); setErr(""); }} className="px-5 py-2 bg-purple-600 text-white rounded-xl text-sm font-semibold">Try Again</button>
                <button onClick={onClose} className="px-5 py-2 border border-gray-200 rounded-xl text-sm text-gray-600">Close</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const PaymentModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  /** Called with Razorpay data when user pays. The parent handles backend booking creation.
   *  Returns a Promise so the modal can stay in 'processing' until backend responds. */
  onSuccess: (paymentData: any) => Promise<void>;
  amount: number;
  loading: boolean;
  bookingId?: string | null;
  serviceId?: string;
  user?: any;
  /** Lets parent drive the modal step (e.g. 'error' when booking creation fails). */
  setPaymentModalStep?: (step: 'init' | 'processing' | 'success' | 'error') => void;
  /** Lets parent inject an error message into the modal. */
  externalError?: string;
  securePricingContext?: {
    pricingToken?: string;
    serviceId?: string;
    checkIn: string;
    checkOut: string;
    guests: { adults: number; children?: number; infants?: number };
    nights: number;
    totalAmount: number;
    currency?: string;
  };
}> = ({ isOpen, onClose, onSuccess, amount, loading, bookingId, serviceId, user, securePricingContext, setPaymentModalStep, externalError }) => {
  const [paymentStep, setPaymentStep] = useState<'init' | 'processing' | 'success' | 'error'>('init');
  const [error, setError] = useState('');
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Reset state each time the modal opens
  useEffect(() => {
    if (isOpen) {
      setPaymentStep('init');
      setError('');
    }
  }, [isOpen]);

  // Sync external error from parent into modal error state
  useEffect(() => {
    if (externalError) {
      setError(externalError);
      setPaymentStep('error');
    }
  }, [externalError]);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  // Load Razorpay script
  useEffect(() => {
    if (!isOpen || razorpayLoaded) return;

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      setRazorpayLoaded(true);
      console.log('✅ Razorpay script loaded');
    };
    script.onerror = () => {
      setError('Failed to load Razorpay. Please refresh the page.');
      console.error('❌ Failed to load Razorpay script');
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, [isOpen, razorpayLoaded]);

  const handlePayment = async () => {
    setPaymentStep('processing');
    setError('');

    try {
      console.log('🔄 Creating Razorpay order...', { bookingId, amount, serviceId });

      // Create Razorpay order — service id is sent so backend uses service pricing branch
      const orderResponse = await apiClient.createRazorpayOrder(
        bookingId || null,
        amount,
        'INR',
        serviceId as string,
        undefined,
        true // isService
      );

      console.log('📦 Order response:', orderResponse);

      if (!orderResponse.success || !orderResponse.data) {
        const errorMsg = orderResponse.error || orderResponse.message || 'Failed to create payment order';
        console.error('❌ Order creation failed:', errorMsg);
        throw new Error(errorMsg);
      }

      const { orderId, key } = orderResponse.data;

      // Initialize Razorpay checkout
      const options = {
        key: key,
        amount: Math.round(amount * 100), // Convert to paise
        currency: 'INR',
        name: 'TripMe',
        description: `Payment for booking${serviceId ? ` - Service ${serviceId}` : ''}`,
        order_id: orderId,
        handler: async function (response: any) {
          console.log('✅ Razorpay payment success:', response);

          // Keep modal in 'processing' — transition to success or error only AFTER
          // the backend successfully creates the booking.  The parent's onSuccess
          // is async and will call setPaymentModalStep when done.
          setPaymentStep('processing');

          try {
            await onSuccess({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              razorpayPaymentDetails: response
            });
            // If onSuccess resolves without throwing, redirect is happening —
            // show brief success state
            setPaymentStep('success');
          } catch (bookingErr: any) {
            console.error('❌ Booking creation failed after Razorpay payment:', bookingErr);
            const msg = bookingErr?.message || 'Booking creation failed after payment. Please contact support.';
            setError(msg);
            setPaymentStep('error');
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || ''
        },
        theme: {
          color: '#1f2937'
        },
        modal: {
          ondismiss: function () {
            setPaymentStep('init');
            console.log('Payment modal closed');
          }
        }
      };

      // Check if Razorpay is available
      if (!(window as any).Razorpay) {
        throw new Error('Razorpay script not loaded. Please refresh the page.');
      }

      // Open Razorpay checkout
      console.log('🚀 Opening Razorpay checkout with options:', { ...options, key: '***' });
      const razorpay = new (window as any).Razorpay(options);

      razorpay.on('payment.failed', function (response: any) {
        console.error('❌ Razorpay payment failed:', response);
        setError(response.error?.description || response.error?.reason || 'Payment failed. Please try again.');
        setPaymentStep('error');
      });

      razorpay.on('payment.authorized', function (response: any) {
        console.log('✅ Payment authorized:', response);
      });

      // Open the Razorpay checkout popup
      razorpay.open();
      console.log('✅ Razorpay checkout opened');
    } catch (error: any) {
      console.error('❌ Error initiating Razorpay payment:', error);
      setError(error.message || 'Failed to initiate payment. Please try again.');
      setPaymentStep('error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 ">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-gray-700 to-gray-800 rounded-2xl flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Complete Payment</h2>
                <p className="text-sm text-gray-600">Secure payment via Razorpay</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {paymentStep === 'init' && (
            <div className="space-y-6">
              {/* Amount Display */}
              <div className="text-center p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl">
                <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                <p className="text-3xl font-bold text-gray-900">{formatPrice(amount)}</p>
              </div>

              {/* Payment Info */}
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-sm text-blue-800">
                    You will be redirected to Razorpay's secure payment gateway to complete your payment.
                  </p>
                </div>
              </div>

              {/* Security Notice */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Lock className="w-5 h-5 text-gray-600" />
                <p className="text-sm text-gray-600">Your payment is secured with SSL encryption</p>
              </div>

              {/* Error Display */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Pay Button */}
              <Button
                onClick={handlePayment}
                disabled={loading || !razorpayLoaded}
                className="w-full bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white font-semibold py-4 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CreditCard className="w-5 h-5 mr-2" />
                {!razorpayLoaded ? 'Loading Razorpay...' : `Pay ${formatPrice(amount)}`}
              </Button>
            </div>
          )}

          {paymentStep === 'processing' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin mx-auto mb-6"></div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Processing…</h3>
              <p className="text-gray-600">Please wait while we confirm your booking securely.</p>
            </div>
          )}

          {paymentStep === 'success' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Booking Confirmed!</h3>
              <p className="text-gray-600">Redirecting you to your booking...</p>
            </div>
          )}

          {paymentStep === 'error' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Something Went Wrong</h3>
              <p className="text-sm text-gray-600 mb-5 leading-relaxed">{error || 'An error occurred during payment'}</p>
              <div className="flex flex-col gap-3">
                {/* Only offer retry when the error is pre-payment (order creation / gateway error).
                    If Razorpay already charged money, tell user to contact support. */}
                {error?.toLowerCase().includes('contact support') || error?.toLowerCase().includes('mismatch') ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                    ⚠️ Your payment was received but booking creation failed. Your money is safe — please contact support with your payment ID.
                  </div>
                ) : (
                  <Button
                    onClick={() => {
                      setPaymentStep('init');
                      setError('');
                    }}
                    className="bg-gray-700 text-white px-6 py-2 rounded-lg"
                  >
                    Try Again
                  </Button>
                )}
                <button
                  onClick={onClose}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Login Gate Section ────────────────────────────────────── */
function LoginGate({ id }: { id: string }) {
  const router = useRouter();
  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden">
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
          <span className="font-semibold text-gray-800">Log in or sign up</span>
        </div>
        <button
          onClick={() => router.push(`/auth/login?redirect=/book/service/${id}`)}
          className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-sm rounded-xl hover:from-purple-700 hover:to-indigo-700 transition"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────── */
export default function ServiceBookingPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { id } = params;
  const { user, isAuthenticated, isLoading } = useAuth();

  /* Parse time slots from URL params */
  const checkIn = searchParams.get("checkIn") || "";   // ISO e.g. 2026-04-24T10:00
  const checkOut = searchParams.get("checkOut") || ""; // ISO e.g. 2026-04-24T11:00

  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [guests, setGuests] = useState(1);
  const [specialRequests, setSpecialRequests] = useState("");
  const [contactInfo, setContactInfo] = useState({ name: "", phone: "", email: "" });
  const [showDetails, setShowDetails] = useState(false);

  /* Populate contact from logged-in user */
  useEffect(() => {
    if (user) setContactInfo({ name: user.name || "", phone: user.phone || "", email: user.email || "" });
  }, [user]);

  /* Load service */
  useEffect(() => {
    if (!id) return;
    apiClient.getService(id as string)
      .then((res: any) => setService(res.data?.service || null))
      .catch(() => setService(null))
      .finally(() => setLoading(false));
  }, [id]);

  /* Derived price */
  const basePrice = service?.pricing?.basePrice || 0;
  const perPersonPrice = service?.pricing?.perPersonPrice || 0;
  const extraGuests = Math.max(0, guests - 1);
  const extraGuestCost = extraGuests * perPersonPrice;
  const platformFee = Math.round(basePrice * 0.12); // 12% platform fee
  const total = basePrice + extraGuestCost + platformFee;

  /* Slot display */
  const slotStart = checkIn ? new Date(checkIn) : null;
  const slotEnd = checkOut ? new Date(checkOut) : null;

  /* Handle booking creation after Razorpay */
  const handlePaymentSuccess = async (paymentData: any) => {
    setBookingError("");
    try {
      const res: any = await apiClient.processPaymentAndCreateBooking({
        serviceId: id,
        checkIn,
        checkOut,
        timeSlot: checkIn && checkOut ? { startTime: checkIn, endTime: checkOut } : undefined,
        guests: { adults: guests, children: 0, infants: 0 },
        specialRequests,
        contactInfo,
        paymentMethod: "razorpay",
        paymentData,
        bookingDuration: "daily",
      });
      if (res.success) {
        router.push(`/bookings/${res.data?.booking?._id || res.data?._id || ""}`);
      } else {
        throw new Error(res.message || "Booking failed");
      }
    } catch (e: any) {
      setBookingError(e?.message || "Booking failed");
      throw e;
    }
  };

  const canBook = isAuthenticated && !!checkIn && !!checkOut;

  /* ── Render ── */
  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-purple-500" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <AlertCircle size={48} className="text-red-400" />
        <h2 className="text-2xl font-bold">Service Not Found</h2>
        <button onClick={() => router.back()} className="flex items-center gap-1 text-purple-600 hover:underline"><ArrowLeft size={16} /> Go Back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-base font-bold text-gray-900">Confirm and pay</h1>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

          {/* ══════ LEFT: Booking Steps ══════ */}
          <div className="lg:col-span-3 space-y-5">

            {/* Step 1: Auth */}
            {!isAuthenticated ? (
              <>
                <LoginGate id={id as string} />
                {/* Greyed-out steps 2 & 3 */}
                {["Add a payment method", "Review your request"].map((label, i) => (
                  <div key={i} className="p-5 border border-gray-200 rounded-2xl opacity-40 cursor-not-allowed">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-500">{i + 2}</div>
                      <span className="font-semibold text-gray-500">{label}</span>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <>
                {/* Step 1: Confirmed login */}
                <div className="p-5 border border-green-200 bg-green-50 rounded-2xl flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center"><CheckCircle2 size={16} className="text-white" /></div>
                  <div>
                    <p className="font-semibold text-green-800">Logged in as {user?.name}</p>
                    <p className="text-xs text-green-600">{user?.email}</p>
                  </div>
                </div>

                {/* Step 2: Contact Info */}
                <div className="border border-gray-200 rounded-2xl overflow-hidden">
                  <div className="p-5 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
                      <span className="font-bold text-gray-800">Your Contact Information</span>
                    </div>
                  </div>
                  <div className="p-5 space-y-4">
                    {[
                      { icon: <User size={16} />, label: "Full Name", key: "name", type: "text" },
                      { icon: <Phone size={16} />, label: "Phone", key: "phone", type: "tel" },
                      { icon: <Mail size={16} />, label: "Email", key: "email", type: "email" },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">{f.label}</label>
                        <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-100 transition">
                          <span className="text-gray-400">{f.icon}</span>
                          <input
                            type={f.type}
                            value={(contactInfo as any)[f.key]}
                            onChange={e => setContactInfo(p => ({ ...p, [f.key]: e.target.value }))}
                            className="flex-1 text-sm outline-none bg-transparent"
                          />
                        </div>
                      </div>
                    ))}

                    {/* Guests */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Number of Guests</label>
                      <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-3 py-2.5">
                        <Users size={16} className="text-gray-400" />
                        <button onClick={() => setGuests(g => Math.max(1, g - 1))} className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 font-bold">−</button>
                        <span className="w-6 text-center font-semibold">{guests}</span>
                        <button onClick={() => setGuests(g => Math.min(service.groupSize?.max || 20, g + 1))} className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 font-bold">+</button>
                        <span className="text-sm text-gray-500 ml-1">(max {service.groupSize?.max || 20})</span>
                      </div>
                    </div>

                    {/* Special requests */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Special Requests (optional)</label>
                      <textarea
                        value={specialRequests}
                        onChange={e => setSpecialRequests(e.target.value)}
                        rows={3}
                        placeholder="Any special requests or notes for the provider…"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Step 3: Review + Pay */}
                <div className="border border-gray-200 rounded-2xl overflow-hidden">
                  <div className="p-5 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
                      <span className="font-bold text-gray-800">Review your request</span>
                    </div>
                  </div>
                  <div className="p-5 space-y-4">
                    {/* Dates */}
                    {slotStart && slotEnd && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Date & Time</span>
                        <span className="font-semibold">{format(slotStart, "EEE, MMM d · h:mm a")} – {format(slotEnd, "h:mm a")}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Guests</span>
                      <span className="font-semibold">{guests} guest{guests > 1 ? "s" : ""}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Cancellation</span>
                      <span className="font-semibold capitalize">{service.cancellationPolicy || "Moderate"}</span>
                    </div>

                    {bookingError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                        {bookingError}
                      </div>
                    )}

                    {/* Ground rules */}
                    <div className="flex gap-2.5 p-3.5 bg-gray-50 rounded-xl">
                      <Shield size={16} className="text-gray-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-gray-500 leading-relaxed">
                        By clicking, you agree to TripMe's <span className="underline cursor-pointer">Terms & Conditions</span> and <span className="underline cursor-pointer">Cancellation Policy</span>.
                        Your payment is protected under our guest guarantee.
                      </p>
                    </div>

                    <button
                      onClick={() => setShowPayment(true)}
                      disabled={!canBook}
                      className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-lg rounded-2xl transition disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
                    >
                      Confirm and Pay · {fmt(total)}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ══════ RIGHT: Service Summary Card ══════ */}
          <div className="lg:col-span-2">
            <div className="sticky top-20 border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              {/* Service thumbnail */}
              <div className="flex gap-4 p-5 border-b border-gray-100">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0 relative">
                  {service.media?.[0]?.url ? (
                    <Image src={service.media[0].url} alt={service.title} fill className="object-cover" sizes="80px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">🛎</div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide truncate">{service.serviceType?.replace(/-/g, " ")}</p>
                  <h2 className="font-bold text-gray-900 leading-snug line-clamp-2 mt-0.5">{service.title}</h2>
                  <p className="text-xs text-gray-400 mt-1 truncate">{service.provider?.name}</p>
                  {service.rating > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      <Star size={12} className="fill-yellow-400 stroke-yellow-400" />
                      <span className="text-xs font-semibold">{Number(service.rating).toFixed(1)}</span>
                      <span className="text-xs text-gray-400">({service.reviewCount || 0})</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Date + location */}
              <div className="p-5 space-y-3 border-b border-gray-100">
                {slotStart && slotEnd && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Date & Time</p>
                    <p className="text-sm font-semibold">{format(slotStart, "EEEE, MMMM d, yyyy")}</p>
                    <p className="text-sm text-gray-500">{format(slotStart, "h:mm a")} – {format(slotEnd, "h:mm a")}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Location</p>
                  <div className="flex items-start gap-1.5">
                    <MapPin size={13} className="text-gray-400 mt-0.5 shrink-0" />
                    <p className="text-sm text-gray-600">{[service.location?.address, service.location?.city, service.location?.state].filter(Boolean).join(", ")}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Duration</p>
                  <div className="flex items-center gap-1.5">
                    <Clock size={13} className="text-gray-400" />
                    <p className="text-sm text-gray-600">{service.duration?.value} {service.duration?.unit}</p>
                  </div>
                </div>
              </div>

              {/* Price breakdown */}
              <div className="p-5">
                <button onClick={() => setShowDetails(d => !d)} className="w-full flex items-center justify-between text-sm font-semibold text-gray-700 mb-3">
                  Price Details {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {showDetails && (
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Base price</span>
                      <span>{fmt(basePrice)}</span>
                    </div>
                    {extraGuestCost > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Extra guests ({extraGuests} × {fmt(perPersonPrice)})</span>
                        <span>{fmt(extraGuestCost)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Platform fee</span>
                      <span>{fmt(platformFee)}</span>
                    </div>
                  </div>
                )}

                <div className="flex justify-between font-bold text-base border-t border-gray-100 pt-3">
                  <span>Total</span>
                  <span>{fmt(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Razorpay modal */}
      <RazorpayModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        amount={total}
        user={user}
        serviceId={id as string}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
