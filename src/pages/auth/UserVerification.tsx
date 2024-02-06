import AuthWrapper from "@/components/auth/AuthWrapper";
import useApi from "@/hooks/useApi";
import { apiPath } from "@/lib/api-path";
import { EMAIL_REGEX } from "@/lib/constant";
import { handleLogin } from "@/redux/reducer/auth";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

interface IError {
	email?: string;
	password?: string;
}
const UserVerification = () => {
	const [email, setEmail] = useState("");
	const [error, setError] = useState<IError>({});
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { apiAction } = useApi();
	const handleSubmit = async () => {
		let err: IError = {};
		if (!email) {
			err = { ...err, email: "Email is required" };
		}

		if (email && !EMAIL_REGEX.test(email)) {
			err = { ...err, email: "Email is not valid" };
		}

		if (Object.keys(err).length > 0) {
			setError(err);
			return;
		}
		const data = await apiAction({
			method: "post",
			url: `${apiPath?.auth?.login}`,
			data: { email },
		});
		if (data) {
			dispatch(handleLogin(data?.data));
			navigate("/");
		}
	};
	return (
		<AuthWrapper>
			<div className="row-span-4 row-start-2 text-4xl">
				Sign In
				<div className="pt-10 xl:pr-20 lg:pr-0 md:pr-0 pr-0">
					<label className="text-sm font-sans font-medium">Email</label>
					<input
						type="text"
						name="username"
						onChange={(e) => {
							setError({ ...error, email: "" });
							setEmail(e.target.value);
						}}
						placeholder="Enter your email"
						className="w-full bg-[#211c50] py-3 px-6 border hover: border-gray-500 rounded shadow text-base font-sans"
					/>
					{error?.email && (
						<p className="text-red-500 text-xs mt-2">{error?.email}</p>
					)}
				</div>
				{/* <div className="pt-2 xl:pr-20 lg:pr-0 md:pr-0 pr-0">
                    <label className="text-sm font-sans font-medium">
                        Password
                    </label>
                    <input
                        type="password"
                        name="password"
                        onChange={(e) => {
                            setError({ ...error, password: "" }); setPassword(e.target.value)
                        }}
                        placeholder="Enter your password"
                        className=" w-full bg-[#211c50] py-3 px-6 border hover: border-gray-500 rounded shadow text-base font-sans" />
                    {error?.password && <p className="text-red-500 text-xs mt-2">{error?.password}</p>}

                    <a href="" className="text-sm font-sans font-medium text-gray-600 underline">
                        Forgot password?
                    </a>
                </div> */}
				<div className="text-sm font-sans font-medium w-full xl:pr-20 lg:pr-0 md:pr-0 pr-0 pt-10">
					<button
						onClick={handleSubmit}
						type="button"
						className="text-center w-full py-4 bg-[#605b98] hover:bg-[#393376] rounded-md text-white">
						SIGN IN
					</button>
				</div>
			</div>
		</AuthWrapper>
	);
};

export default UserVerification;
