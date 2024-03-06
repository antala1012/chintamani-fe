import useApi from "@/hooks/useApi";
import { apiPath } from "@/lib/api-path";
import { addCartProduct } from "@/redux/reducer/cart";
import { useCallback, useState } from "react";
import useRazorpay from "react-razorpay";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import SideComponent from "./SideComponent";

const VITE_RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;
const VITE_RAZORPAY_KEY_SECRET = import.meta.env.VITE_RAZORPAY_KEY_SECRET;

const CheckoutComponent = () => {
	const dispatch = useDispatch();
	const [address, setAddress] = useState({});
	const [contact, setContact] = useState();
	const [currency, setCurrency] = useState({ value: "", price: "" });
	const [isSave, setIsSave] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();

	const {
		auth: { user, token },
		cart: { cartProduct },
	} = useSelector((state: any) => state);

	function formatPrice(price = 0) {
		const roundedPrice = Math.round(price * 100) / 100;
		const formattedPrice = roundedPrice.toFixed(2);
		return formattedPrice;
	}

	const handleTotalAmount = () => {
		const totalAmount = cartProduct?.reduce((prev: number, products: any) => {
			let product = products?.product || products;
			return (
				prev +
				(products?.quantity || 1) * (product?.disccount_price || product?.price)
			);
		}, 0);
		return formatPrice(totalAmount);
	};

	const [Razorpay] = useRazorpay();

	//   const {
	//     auth: { token, user }
	//   } = useSelector((state: { auth: any }) => state);
	const { apiAction } = useApi();

	//   const createOrder = async (params: any) => {
	//     try {
	//       const data = await apiAction({
	//         method: "post",
	//         url: `${apiPath?.checkOut?.createOrder}`,
	//         data: { userid: params?.userid, totalprice: params?.totalprice },
	//         headers: { Authorization: `Bearer ${token}` },
	//       });
	//       return data;
	//     } catch (error) {
	//       console.log(error);
	//     }
	//   };

	const createOrder = async (params: any) => {
		try {
			const totalPrice = +params?.totalprice * +currency?.price;
			// First API call to create an order
			const data = await apiAction({
				method: "post",
				url: `${apiPath?.checkOut?.createOrder}`,
				data: {
					userid: params?.userid,
					totalprice: params?.totalprice,
					calculatedPrice: totalPrice,
					mobile: contact,
					address: JSON.stringify(address),
					currency: currency.value,
				},
				headers: { Authorization: `Bearer ${token}` },
			});

			const fetchCartData = async () => {
				const cartData = await apiAction({
					method: "get",
					url: `${apiPath?.user?.allCart}/${user?.id}`,
					headers: { Authorization: `Bearer ${token}` },
				});

				if (cartData) {
					dispatch(addCartProduct(cartData?.data));
				}
			};

			await fetchCartData();

			return data;
		} catch (error) {
			console.log(error);
		}
	};

	const handlePayment = useCallback(async () => {
		setIsLoading(true);

		try {
			const params = { userid: user?.id, totalprice: handleTotalAmount() };
			const order = await createOrder(params);
			const options = {
				key: VITE_RAZORPAY_KEY_ID,
				secret: VITE_RAZORPAY_KEY_SECRET,
				amount: order?.data?.orderDetails?.amount_due,
				currency: order?.data?.orderDetails?.currency,
				name: "Acme Corp",
				description: "Test Transaction",
				order_id: order?.data?.orderDetails?.id,
				handler: (res: Object) => {
					updateOrder(order?.data?.id);
					toast.success("Payment success");
					navigate("/");
				},
				prefill: {
					name: `${user?.firstname} ${user?.lastname}`,
					email: user?.email,
					contact: contact,
					// method: "netbanking"
				},
				notes: {
					address: "Razorpay Corporate Office",
				},
				theme: {
					color: "#3399cc",
				},
			};

			const rzpay = new Razorpay(options);
			rzpay.open();
		} catch (error) {
			console.error("Error handling payment:", error);
		} finally {
			setIsLoading(false);
		}
	}, [createOrder, handleTotalAmount, user, setIsLoading]);

	const updateOrder = async (orderid: number) => {
		apiAction({
			method: "patch",
			url: `${apiPath?.checkOut?.updateOrder}`,
			data: { payment: 2, Address: Object.values(address).join(", "), orderid },
			headers: { Authorization: `Bearer ${token}` },
		});
	};

	return (
		<div className="container mx-auto">
			<div className="w-full bg-white border-t border-b border-gray-200 px-5 py-10 text-gray-800">
				<div className="w-full">
					<div className="-mx-3 md:flex items-start">
						<div className="px-3 md:w-6/12 lg:pr-10">
							{cartProduct?.map((prod: any) => {
								let product = prod?.product || prod;
								let qty = prod?.quantity || 1;
								return (
									<div className="w-full mx-auto text-gray-800 font-light mb-6 border-b border-gray-200 pb-6">
										<div className="w-full flex items-center">
											<div className="overflow-hidden rounded-lg w-16 h-16 bg-gray-50 border border-gray-200 flex justify-center">
												<img
													src={product?.productimage?.[0]}
													className="object-fill h-full"
													alt=""
												/>
											</div>
											<div className="flex-grow pl-3">
												<h6 className="font-semibold uppercase text-gray-600">
													{product?.maintitle}
												</h6>
												<p className="text-gray-400">{qty}</p>
											</div>
											<div>
												<div className="text-[#b3af54] text-xl mt-1">
													{product?.disccount_price ? (
														<>
															<del>${formatPrice(product?.price)}</del>
															&nbsp;
															<span className="font-semibold">
																${formatPrice(product?.disccount_price)}
															</span>
														</>
													) : (
														<>
															<span className="font-semibold">
																${formatPrice(product?.price)}
															</span>
														</>
													)}
												</div>
											</div>
										</div>
									</div>
								);
							})}
							{/* <div className="mb-6 pb-6 border-b border-gray-200">
                                <div className="-mx-2 flex items-end justify-end">
                                    <div className="flex-grow px-2 lg:max-w-xs">
                                        <label className="text-gray-600 font-semibold text-sm mb-2 ml-1">Discount code</label>
                                        <div>
                                            <input className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:border-indigo-500 transition-colors" placeholder="XXXXXX" type="text" />
                                        </div>
                                    </div>
                                    <div className="px-2">
                                        <button className="block w-full max-w-xs mx-auto border border-transparent bg-gray-400 hover:bg-gray-500 focus:bg-gray-500 text-white rounded-md px-5 py-2 font-semibold">APPLY</button>
                                    </div>
                                </div>
                            </div> */}
							{/* <div className="w-full flex mb-3 items-center">
                                    <div className="flex-grow">
                                        <span className="text-gray-600">Subtotal</span>
                                    </div>
                                    <div className="pl-3">
                                        <span className="font-semibold">${handleTotalAmount()}</span>
                                    </div>
                                </div> */}
							{/* <div className="w-full flex items-center">
                                    <div className="flex-grow">
                                        <span className="text-gray-600">Taxes (GST)</span>
                                    </div>
                                    <div className="pl-3">
                                        <span className="font-semibold">$19.09</span>
                                    </div>
                                </div> */}
							<div className="mb-6 pb-6 border-b border-gray-200 md:border-none text-gray-800 text-xl">
								<div className="w-full flex items-center">
									<div className="flex-grow">
										<span className="text-gray-600">Total</span>
									</div>
									<div className="pl-3">
										{/* <span className="font-semibold text-gray-400 text-sm">
                      USD
                    </span>{" "} */}
										<span className="font-semibold">
											${handleTotalAmount()}
										</span>
									</div>
								</div>
							</div>
						</div>
						<div className="px-3 md:w-6/12">
							<SideComponent
								address={address}
								setAddress={setAddress}
								contact={contact}
								setContact={setContact}
								setCurrency={setCurrency}
								currency={currency}
								setIsSave={setIsSave}
							/>

							{/* <PaymentComponent totalPrice={handleTotalAmount()}/> */}
							{/* <div className="w-full mx-auto rounded-lg bg-white border border-gray-200 text-gray-800 font-light mb-6">
                                <div className="w-full p-3 border-b border-gray-200">
                                    <div className="mb-5">
                                        <label htmlFor="type1" className="flex items-center cursor-pointer">
                                            <input type="radio" className="form-radio h-5 w-5 text-indigo-500" name="type" id="type1" checked />
                                            <img src="https://leadershipmemphis.org/wp-content/uploads/2020/08/780370.png" className="h-6 ml-3" />
                                        </label>
                                    </div>
                                    <div>
                                        <div className="mb-3">
                                            <label className="text-gray-600 font-semibold text-sm mb-2 ml-1">Name on card</label>
                                            <div>
                                                <input className="w-full px-3 py-2 mb-1 border border-gray-200 rounded-md focus:outline-none focus:border-indigo-500 transition-colors" placeholder="John Smith" type="text" />
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <label className="text-gray-600 font-semibold text-sm mb-2 ml-1">Card number</label>
                                            <div>
                                                <input className="w-full px-3 py-2 mb-1 border border-gray-200 rounded-md focus:outline-none focus:border-indigo-500 transition-colors" placeholder="0000 0000 0000 0000" type="text" />
                                            </div>
                                        </div>
                                        <div className="mb-3 -mx-2 flex items-end">
                                            <div className="px-2 w-1/4">
                                                <label className="text-gray-600 font-semibold text-sm mb-2 ml-1">Expiration date</label>
                                                <div>
                                                    <select className="form-select w-full px-3 py-2 mb-1 border border-gray-200 rounded-md focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer">
                                                        <option value="01">01 - January</option>
                                                        <option value="02">02 - February</option>
                                                        <option value="03">03 - March</option>
                                                        <option value="04">04 - April</option>
                                                        <option value="05">05 - May</option>
                                                        <option value="06">06 - June</option>
                                                        <option value="07">07 - July</option>
                                                        <option value="08">08 - August</option>
                                                        <option value="09">09 - September</option>
                                                        <option value="10">10 - October</option>
                                                        <option value="11">11 - November</option>
                                                        <option value="12">12 - December</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="px-2 w-1/4">
                                                <select className="form-select w-full px-3 py-2 mb-1 border border-gray-200 rounded-md focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer">
                                                    <option value="2020">2020</option>
                                                    <option value="2021">2021</option>
                                                    <option value="2022">2022</option>
                                                    <option value="2023">2023</option>
                                                    <option value="2024">2024</option>
                                                    <option value="2025">2025</option>
                                                    <option value="2026">2026</option>
                                                    <option value="2027">2027</option>
                                                    <option value="2028">2028</option>
                                                    <option value="2029">2029</option>
                                                </select>
                                            </div>
                                            <div className="px-2 w-1/4">
                                                <label className="text-gray-600 font-semibold text-sm mb-2 ml-1">Security code</label>
                                                <div>
                                                    <input className="w-full px-3 py-2 mb-1 border border-gray-200 rounded-md focus:outline-none focus:border-indigo-500 transition-colors" placeholder="000" type="text" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full p-3">
                                    <label htmlFor="type2" className="flex items-center cursor-pointer">
                                        <input type="radio" className="form-radio h-5 w-5 text-indigo-500" name="type" id="type2" />
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" width="80" className="ml-3" />
                                    </label>
                                </div>
                            </div> */}
							<div>
								<button
									style={{ opacity: isSave ? 1 : 0.5 }}
									className="block w-full max-w-xs mx-auto disabled:bg-indigo-300 disabled:hover:bg-indigo-300 bg-indigo-500 hover:bg-indigo-700 focus:bg-indigo-700 text-white rounded-lg px-3 py-2 font-semibold relative"
									disabled={!isSave || isLoading || !cartProduct?.length}
									onClick={handlePayment}>
									{isLoading && (
										<div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
											<div className="animate-spin rounded-full h-6 w-6 border-t-4 border-white-700"></div>
										</div>
									)}
									<i className="mdi mdi-lock-outline mr-1"></i>{" "}
									{!isLoading && <>PAY NOW</>}
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CheckoutComponent;
