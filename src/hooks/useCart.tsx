import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart')

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  useEffect(()=> {
    localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart))
  }, [cart])

  const addProduct = async (productId: number) => {
    try {
      const product = await api.get(`products/${productId}`)
      const productData: Omit<Product, 'amount'> = product.data

      const stock = await api.get(`stock/${productId}`)
      const stockData: Stock = stock.data; 

      const finalProduct = {
        ...productData,
        amount: 1
      }
        
      const findProduct = cart.some(product => product.id === productData.id)
      if(findProduct) {

        const productQuantity = cart.find(product => product.id === productId)?.amount

        if(productQuantity && productQuantity < stockData.amount) {

          const newProducts = cart.map(product => {
            if(product.id === productId) {
              return {
                ...product,
                amount: product.amount + 1
              }
            } else {
              return product
            }
          })

          setCart(newProducts)

        } else {
          toast.error('Quantidade solicitada fora de estoque')
        }

      } else {
        setCart(prevState => [...prevState, finalProduct])
      }

    } catch {
      toast.error('Erro na adição do produto')
    }
  };

  const removeProduct = (productId: number) => {
    try {
    
    } catch {
      // TODO
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {

      if(amount <= 0) return;

      const newCart = cart.map(product => {
        if(product.id === productId) {
          return {
            ...product,
            amount
          }
        } else {
          return product
        }
      })

      setCart(newCart)

    } catch {
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
