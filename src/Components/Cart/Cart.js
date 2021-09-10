import React, { useContext, useState, Fragment } from 'react';

import Modal from '../UI/Modal';
import CartItem from './CartItem';
import classes from './Cart.module.css';
import CartContext from '../../Store/cart-context';
import Checkout from './Checkout';

const Cart = (props) => {
	const [isCheckout, setIsCheckout] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [didSubmit, setDidSubmit] = useState(false);
	const [errorState, setErrorState] = useState(false);
	const cartCtx = useContext(CartContext);

	const totalAmount = `$${cartCtx.totalAmount.toFixed(2)}`;
	const hasItems = cartCtx.items.length > 0;

	const cartItemRemoveHandler = (id) => {
		cartCtx.removeItem(id);
	};

	const cartItemAddHandler = (item) => {
		cartCtx.addItem({ ...item, amount: 1 });
	};

	const orderHandler = () => {
		setIsCheckout(true);
	};

	const onSubmitHandler = async (userData) => {
		setIsSubmitting(true);
		// console.log(userData);
		const response = await fetch(
			'https://my-food-ordering-application-default-rtdb.firebaseio.com/orders.json',
			{
				method: 'POST',
				body: JSON.stringify({
					userData: userData,
					orderedItems: cartCtx.items,
				}),
			}
		);
		if (!response.ok) {
			setErrorState(true);
		}
		setIsSubmitting(false);
		setDidSubmit(true);
		cartCtx.clearCart();
	};

	const cartItems = (
		<ul className={classes['cart-items']}>
			{cartCtx.items.map((item) => (
				<CartItem
					key={item.id}
					name={item.name}
					amount={item.amount}
					price={item.price}
					onRemove={cartItemRemoveHandler.bind(null, item.id)}
					onAdd={cartItemAddHandler.bind(null, item)}
				/>
			))}
		</ul>
	);
	const modalActions = (
		<div className={classes.actions}>
			<button className={classes['button--alt']} onClick={props.onClose}>
				Close
			</button>
			{hasItems && (
				<button onClick={orderHandler} className={classes.button}>
					Order
				</button>
			)}
		</div>
	);

	const cartModalContent = (
		<Fragment>
			{cartItems}
			<div className={classes.total}>
				<span>Total Amount</span>
				<span>{totalAmount}</span>
			</div>
			{isCheckout && (
				<Checkout onConfirm={onSubmitHandler} onCancel={props.onClose} />
			)}
			{!isCheckout && modalActions}
		</Fragment>
	);

	const isSubmittingModalContent = <p>Sending Order Data...</p>;
	const didSubmitModalContent = (
		<Fragment>
			<p>Order Confirmed...</p>
			<div className={classes.actions}>
				<button className={classes.button} onClick={props.onClose}>
					Close
				</button>
			</div>
		</Fragment>
	);
	const isErrorModalContent = <p>Something Went Wrong...</p>;
	return (
		<Modal onClose={props.onClose}>
			{!isSubmitting && !didSubmit && !errorState && cartModalContent}
			{isSubmitting && !didSubmit && !errorState && isSubmittingModalContent}
			{didSubmit && !isSubmitting && !errorState && didSubmitModalContent}
			{errorState && isErrorModalContent}
		</Modal>
	);
};

export default Cart;
