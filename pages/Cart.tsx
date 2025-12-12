
import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowLeft, CheckCircle, CreditCard, Banknote, Save, LogIn, ShoppingCart } from 'lucide-react';
import { UserInfo, Order, OrderStatus } from '../types';
import { createOrder } from '../services/orderService';
import OrderProgressTracker from '../components/OrderProgressTracker';
import { COLORS, MESSAGES, LOCALE } from '../config';

const Cart: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart, isAuthenticated, currentUser } = useStore();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Cart, 2: Info/Payment, 3: Success
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: '', email: '', address: '', city: '', zip: '', paymentMethod: 'credit'
  });
  const [saveMessage, setSaveMessage] = useState('');
  const [newOrder, setNewOrder] = useState<Order | null>(null);
  const [orderCreationError, setOrderCreationError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      setUserInfo(prev => ({
        ...prev,
        name: currentUser.name || '',
        email: currentUser.email || ''
      }));
    }
  }, [currentUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveCart = () => {
    localStorage.setItem('ecoJardimCart', JSON.stringify(cart));
    setSaveMessage('Carrinho salvo com sucesso!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated || !currentUser) {
      navigate('/entrar');
      return;
    }

    try {
      // Create the order object
      const orderData = {
        user_id: currentUser.id,
        items: cart,
        total: cartTotal + 50, // Adding shipping cost
        userInfo,
        status: OrderStatus.PENDING as OrderStatus,
        date: new Date().toISOString(),
      };

      // In a real app, process payment here before creating the order
      // For now, we'll create the order directly
      const result = await createOrder(orderData);

      if (result.success && result.data) {
        setNewOrder(result.data);
        setStep(3);
        clearCart();
      } else {
        setOrderCreationError(result.error || 'Erro ao processar o pedido. Tente novamente mais tarde.');
      }
    } catch (error) {
      setOrderCreationError('Erro ao processar o pedido. Tente novamente mais tarde.');
      console.error('Error creating order:', error);
    }
  };

  const proceedToCheckout = () => {
    if (!isAuthenticated) {
      navigate('/entrar');
      return;
    }
    setStep(2);
  };

  if (cart.length === 0 && step !== 3) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-stone-50 px-4 text-center">
        <h2 className="text-3xl font-serif font-bold text-stone-800 mb-4">{MESSAGES.cart.empty}</h2>
        <p className="text-stone-500 mb-8">{MESSAGES.cart.emptySuggestion}</p>
        <Link 
          to="/shop" 
          className="font-bold py-3 px-8 rounded-full transition-all text-white"
          style={{ backgroundColor: COLORS.primary[600] }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.primary[700]}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.primary[600]}
        >
          {MESSAGES.buttons.startShopping}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-stone-200 -z-0"></div>
            <div 
              className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white`}
              style={{ backgroundColor: step >= 1 ? COLORS.primary[600] : COLORS.secondary[200], color: step >= 1 ? 'white' : COLORS.secondary[500] }}
            >1</div>
            <div 
              className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm`}
              style={{ backgroundColor: step >= 2 ? COLORS.primary[600] : COLORS.secondary[200], color: step >= 2 ? 'white' : COLORS.secondary[500] }}
            >2</div>
            <div 
              className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm`}
              style={{ backgroundColor: step >= 3 ? COLORS.primary[600] : COLORS.secondary[200], color: step >= 3 ? 'white' : COLORS.secondary[500] }}
            >3</div>
          </div>
          <div className="flex justify-between text-xs font-semibold mt-2 text-stone-500">
            <span>{MESSAGES.cart.steps.cart}</span>
            <span>{MESSAGES.cart.steps.checkout}</span>
            <span>{MESSAGES.cart.steps.confirmation}</span>
          </div>
        </div>

        {step === 1 && (
          <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
            <div className="p-6 border-b border-stone-100 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-stone-800">{MESSAGES.cart.reviewItems}</h2>
              <Link to="/shop" className="text-sm font-semibold" style={{ color: COLORS.primary[600] }}>
                {MESSAGES.buttons.continueShopping}
              </Link>
            </div>
            
            <div className="divide-y divide-stone-100">
              {cart.map(item => (
                <div key={item.id} className="p-6 flex flex-col sm:flex-row items-center">
                  <img src={item.imageUrl} alt={item.name} className="w-20 h-20 object-cover rounded-md mb-4 sm:mb-0 sm:mr-6" />
                  <div className="flex-1 text-center sm:text-left mb-4 sm:mb-0">
                    <h3 className="font-bold text-stone-800">{item.name}</h3>
                    <p className="text-sm text-stone-500">{item.measurements} - {item.unit}</p>
                    <p className="font-bold mt-1" style={{ color: COLORS.primary[600] }}>
                      {LOCALE.formatCurrency(item.price)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center border border-stone-200 rounded-lg">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-2 hover:bg-stone-100 text-stone-600" disabled={item.quantity <= 1} aria-label="Diminuir quantidade"><Minus className="w-4 h-4" /></button>
                      <span className="w-12 text-center font-semibold text-stone-800">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2 hover:bg-stone-100 text-stone-600" aria-label="Aumentar quantidade"><Plus className="w-4 h-4" /></button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700 p-2" aria-label="Remover item"><Trash2 className="w-5 h-5" /></button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-stone-50 p-6">
              <div className="flex justify-between items-center text-xl font-bold text-stone-800 mb-6">
                <span>{MESSAGES.cart.estimatedTotal}:</span>
                <span>{LOCALE.formatCurrency(cartTotal)}</span>
              </div>
              
              <div className="flex flex-col space-y-3">
                {isAuthenticated ? (
                  <button 
                    onClick={proceedToCheckout} 
                    className="w-full text-white font-bold py-4 rounded-lg shadow-lg transition-all"
                    style={{ backgroundColor: COLORS.primary[600] }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.primary[700]}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.primary[600]}
                  >
                    {MESSAGES.buttons.proceedToPayment}
                  </button>
                ) : (
                  <button 
                    onClick={() => navigate('/entrar')} 
                    className="w-full text-white font-bold py-4 rounded-lg shadow-lg transition-all flex items-center justify-center"
                    style={{ backgroundColor: COLORS.primary[700] }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.primary[800]}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.primary[700]}
                  >
                    <LogIn className="w-5 h-5 mr-2" />
                    {MESSAGES.buttons.loginToCheckout}
                  </button>
                )}
                
                <button 
                  onClick={handleSaveCart}
                  className="w-full font-semibold py-3 rounded-lg transition-all border"
                  style={{ 
                    backgroundColor: 'white',
                    borderColor: COLORS.secondary[200],
                    color: COLORS.secondary[600]
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = COLORS.primary[300];
                    e.currentTarget.style.color = COLORS.primary[700];
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = COLORS.secondary[200];
                    e.currentTarget.style.color = COLORS.secondary[600];
                  }}
                >
                  <Save className="w-5 h-5 mr-2 inline" />
                  {MESSAGES.buttons.saveCart}
                </button>
                
                {saveMessage && (
                  <div 
                    className="text-center text-sm font-medium py-2 rounded-lg border animate-fade-in"
                    style={{ 
                      color: COLORS.status.success,
                      backgroundColor: COLORS.primary[50],
                      borderColor: COLORS.primary[100]
                    }}
                  >
                    {saveMessage}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleCheckout} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100">
                <h3 className="text-lg font-bold text-stone-800 mb-4 border-b pb-2">Dados de Entrega</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-stone-600 mb-1">Nome Completo</label>
                    <input id="name" required name="name" value={userInfo.name} onChange={handleInputChange} type="text" className="w-full p-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-stone-600 mb-1">Email</label>
                    <input id="email" required name="email" value={userInfo.email} onChange={handleInputChange} type="email" className="w-full p-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
                  </div>
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-stone-600 mb-1">Endereço</label>
                    <input id="address" required name="address" value={userInfo.address} onChange={handleInputChange} type="text" className="w-full p-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" placeholder="Rua, Número, Bairro" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-stone-600 mb-1">Cidade</label>
                      <input id="city" required name="city" value={userInfo.city} onChange={handleInputChange} type="text" className="w-full p-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
                    </div>
                    <div>
                      <label htmlFor="zip" className="block text-sm font-medium text-stone-600 mb-1">CEP</label>
                      <input id="zip" required name="zip" value={userInfo.zip} onChange={handleInputChange} type="text" className="w-full p-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100">
                <h3 className="text-lg font-bold text-stone-800 mb-4 border-b pb-2">Pagamento</h3>
                <div className="space-y-3">
                   <label className={`flex items-center p-4 border rounded-lg cursor-pointer ${userInfo.paymentMethod === 'credit' ? 'border-emerald-500 bg-emerald-50' : 'border-stone-200'}`}>
                    <input type="radio" name="paymentMethod" value="credit" checked={userInfo.paymentMethod === 'credit'} onChange={handleInputChange} className="text-emerald-600 focus:ring-emerald-500" />
                    <CreditCard className="ml-3 mr-2 text-stone-600" />
                    <span className="font-medium text-stone-700">Cartão de Crédito</span>
                  </label>
                  <label className={`flex items-center p-4 border rounded-lg cursor-pointer ${userInfo.paymentMethod === 'pix' ? 'border-emerald-500 bg-emerald-50' : 'border-stone-200'}`}>
                    <input type="radio" name="paymentMethod" value="pix" checked={userInfo.paymentMethod === 'pix'} onChange={handleInputChange} className="text-emerald-600 focus:ring-emerald-500" />
                    <div className="ml-3 mr-2 font-bold text-emerald-600 border border-emerald-600 rounded px-1 text-xs">PIX</div>
                    <span className="font-medium text-stone-700">Pagamento Instantâneo</span>
                  </label>
                  <label className={`flex items-center p-4 border rounded-lg cursor-pointer ${userInfo.paymentMethod === 'debit' ? 'border-emerald-500 bg-emerald-50' : 'border-stone-200'}`}>
                    <input type="radio" name="paymentMethod" value="debit" checked={userInfo.paymentMethod === 'debit'} onChange={handleInputChange} className="text-emerald-600 focus:ring-emerald-500" />
                    <Banknote className="ml-3 mr-2 text-stone-600" />
                    <span className="font-medium text-stone-700">Débito na Entrega</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="md:col-span-1">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100 sticky top-24">
                <h3 className="text-lg font-bold text-stone-800 mb-4">Resumo do Pedido</h3>
                <div className="space-y-2 mb-4 text-sm text-stone-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>R$ {cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Frete (Estimado)</span>
                    <span>R$ 50,00</span>
                  </div>
                </div>
                <div className="border-t pt-4 flex justify-between items-center font-bold text-xl text-stone-800 mb-6">
                  <span>Total</span>
                  <span>R$ {(cartTotal + 50).toFixed(2)}</span>
                </div>
                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg shadow-lg transition-colors mb-3">
                  Finalizar Compra
                </button>
                <button type="button" onClick={() => setStep(1)} className="w-full bg-transparent hover:bg-stone-50 text-stone-600 font-semibold py-2 rounded-lg transition-colors flex items-center justify-center">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                </button>
              </div>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="bg-white rounded-xl shadow-lg border border-emerald-100 max-w-4xl mx-auto">
            <div className="p-8 text-center border-b border-emerald-100">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-emerald-600" />
              </div>
              <h2 className="text-3xl font-serif font-bold text-emerald-800 mb-4">Pedido Realizado com Sucesso!</h2>
              <p className="text-stone-600 text-lg mb-2">
                Obrigado por comprar na EcoJardim & Pedras.
              </p>
              <p className="text-stone-600 mb-6">
                Enviamos um email de confirmação para <strong>{userInfo.email}</strong> com os detalhes da entrega.
              </p>

              {orderCreationError && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
                  {orderCreationError}
                </div>
              )}
            </div>

            {newOrder && (
              <div className="p-6">
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-stone-800 mb-4 flex items-center">
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Acompanhe seu pedido
                  </h3>
                  <OrderProgressTracker order={newOrder} />
                </div>
              </div>
            )}

            <div className="p-6 bg-stone-50 border-t border-stone-200">
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-full transition-all">
                  Voltar ao Início
                </Link>
                <Link to="/perfil" className="bg-white border border-emerald-600 text-emerald-600 hover:bg-emerald-50 font-bold py-3 px-8 rounded-full transition-all">
                  Meus Pedidos
                </Link>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Cart;
