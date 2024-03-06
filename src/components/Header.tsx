import { useEffect, useRef, useState } from "react";
import LogoShape from "../../public/assests/Images/logo-shape.png";
import MainLogo from "../../public/assests/Images/main-logo.png";

import useApi from "@/hooks/useApi";
import { apiPath } from "@/lib/api-path";
import { Category, subCategory } from "@/lib/interfaces/category";
import { handleLogout, setUser } from "@/redux/reducer/auth";
import {
  addCartProduct,
  addWishLishProduct,
  setOpenCart,
} from "@/redux/reducer/cart";
import { setCategory, setFilterProduct } from "@/redux/reducer/category";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import {
  faBars,
  faCartShopping,
  faClose,
  faSearch,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Select from "react-select";
import { toast } from "react-toastify";
import CVD from "../../public/assests/Images/cvd.png";

interface Props {
  setOpenCart?: () => void;
}

interface Country {
  value: string;
  label: JSX.Element;
  currency: string[];
}

interface Currency {
  value: string;
  label: string;
}

const Header = ({}: Props) => {
  const [categories, setCategories] = useState([]);
  const [menu, setMenu] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dispatch = useDispatch();
  const { apiAction } = useApi();
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [KnowledgeOpen, setKnowledgeOpen] = useState(false);
  const [AboutOpen, setAboutOpen] = useState(false);
  const {
    auth: { user, token },
    cart: { cartCount, wishListCount },
  } = useSelector((state: { auth: any; cart: any }) => state);
  // const { category } = useSelector((state: any) => state?.category);
  const modalRef: any = useRef(null);

  const handleOutsideClick = (e: any) => {
    if (modalRef.current && !modalRef?.current?.contains(e.target)) {
      setMenuOpen(false);
    }
  };  

  useEffect(() => {
    if (menuOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [menuOpen]);

  useEffect(() => {
    const handleRouteChange = () => {
      setMenuOpen(false);
    };
    if (menuOpen) {
      document.body.classList.add("modal-open");
      window.addEventListener("popstate", handleRouteChange);
    }
    return () => {
      document.body.classList.remove("modal-open");
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, [menuOpen]);

  const navigate = useNavigate();

  // const debounce = (func: (...args: any[]) => void, delay: number) => {
  //   let timeoutId: NodeJS.Timeout;
  //   return (...args: any[]) => {
  //     clearTimeout(timeoutId);
  //     timeoutId = setTimeout(() => {
  //       func(...args);
  //     }, delay);
  //   };
  // };

  useEffect(() => {
    const handleScroll = () => {
      // debouncedHandleScroll();
      const element = document.getElementById("sticky__header");
      const scrollTop = window.scrollY;
      if (scrollTop > 200) {
        element?.classList.add("top-0");
        element?.classList.remove("-top-full");
      } else {
        element?.classList.remove("top-0");
        element?.classList.add("-top-full");
      }
    };
    getCategories();
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [window.location.pathname]);

  const getCategories = async () => {
    let data = await apiAction({
      method: "get",
      url: `${apiPath?.categories?.all}?page=1&pageSize=100`,
    });
    setCategories(data?.data);
  };

  useEffect(() => {
    if (user?.id) {
      fetchCartData();
      fetchWishlistData();
    }
  }, []);

  const fetchCartData = async () => {
    const data = await apiAction({
      method: "get",
      url: `${apiPath?.user?.allCart}/${user?.id}`,
      headers: { Authorization: `Bearer ${token}` },
    });
    if (data) dispatch(addCartProduct(data?.data));
  };

  const fetchWishlistData = async () => {
    const data = await apiAction({
      method: "get",
      url: `${apiPath?.user?.allWishlist}/${user?.id}`,
      headers: { Authorization: `Bearer ${token}` },
    });
    // console.log("🚀 ~ file: Diamonds.tsx:60 ~ fetchWishlistData ~ data:", data?.data?.whishlist_products_id, data?.data?.whishlist_products_id?.map((id: string) => id))
    if (data) dispatch(addWishLishProduct(data?.data));
  };

  const handleSearch = async () => {
    if (Boolean(search)) {
      navigate("/product-category");
      dispatch(setCategory([{ path: "Shop", name: "Shop" }]));
      dispatch(setFilterProduct({ search: search }));
    }
  };

  const [countries, setCountries] = useState<Country[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);  

  useEffect(() => {
    // Fetch countries along with currencies
    axios
      .get("https://restcountries.com/v3.1/all?fields=name,flags,currencies")
      .then((response) => {
        const countriesData: Country[] = response.data.map((country: any) => ({
          value: country.name.common,
          label: (
            <div className="flex items-center cursor-pointer">
              <img
                src={country.flags.svg}
                alt={country.name.common}
                className="mr-2 w-5 h-5"
              />
              {country.name.common}
            </div>
          ),
          currency: country.currencies || [],
        }));
        setCountries(countriesData);
      })
      .catch((error) => {
        console.error("Error fetching countries:", error);
      });

    // Fetch currencies separately
    axios
      .get("https://open.er-api.com/v6/latest")
      .then((response) => {
        const currenciesData: Currency[] = Object.keys(response.data.rates).map(
          (currency) => ({
            value: currency,
            label: currency,
          })
        );

        setCurrencies(currenciesData);
      })
      .catch((error) => {
        console.error("Error fetching currencies:", error);
      });

    
    }, []);
    
  useEffect(() => {
    setSelectedCountry(user?.country);
    setSelectedCurrency(user?.currency);
  }, [user])

  const updateUserData = async (data: any) => {
    try {
      const response = await apiAction({
        method: "patch",
        url: `${apiPath?.auth?.updateUser}`,
        data: data,
        headers: {
          Authorization: `Bearer ${token}`,
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      if (response) {
        dispatch(setUser(response?.data));
        toast.success("User Updated Successfully");
      }
    } catch (error) {
      console.error("Update failed:", error);
    }
  }

  const handleCountryChange = async(selectedOption: Country | null) => {
    let updatedFormData: any = {
      country: selectedOption?.value,
      userid: user.id,
    };

    updateUserData(updatedFormData)
    setSelectedCountry(selectedOption);
  };  

  const handleCurrencyChange = async (selectedOption: Currency | null) => {
    let updatedFormData: any = {
      currency: selectedOption?.value,
      userid: user.id,
    };

    updateUserData(updatedFormData)
    setSelectedCurrency(selectedOption);
  }

  const headerMenu = (
    <>
      <li className="relative group">
        <Link
          to={""}
          className="py-5 px-[15px] group-hover:bg-[#eee] group-hover:border-t-[3px] group-hover:border-[#211c50] text-sm border-t-[3px] border-transparent text-[#211c50] font-normal hover:bg-[#eee] flex items-center"
        >
          Home
        </Link>
      </li>
      {categories?.map((category: Category, index: number) => {
        return (
          <li
            key={index}
            className="relative group list-none flex flex-col"
            onClick={() =>
              category?.subCategories?.length
                ? {}
                : dispatch(
                    setCategory([
                      {
                        path: category?.name,
                        id: category?.id,
                        name: "categoryid",
                      },
                    ])
                  )
            }
          >
            {category?.subCategories?.length ? (
              <>
                <div
                  // to={category?.subCategories?.length ? "" : "/product-category"}
                  className={`group-hover:bg-[#eee] group-hover:border-t-[3px] group-hover:border-[#211c50] py-5 px-[15px] text-sm text-[#211c50] font-normal border-t-[3px] border-transparent ${
                    category?.subCategories?.length &&
                    "after:w-[0.35em] after:h-[0.35em] after:border-r-[0.1em] after:border-t-[0.1em] after:rotate-[135deg] after:border-[#211c50] after:ml-[0.5em] hover:visible hover:opacity-[1]"
                  }  flex items-center `}
                >
                  {category?.name}
                </div>
                <ul className="group-hover:visible group-hover:opacity-[1] bg-[#eee] min-w-[270px] z-[2147483641] p-0 flex-col whitespace-nowrap invisible opacity-0 flex  absolute top-[100%]">
                  {category?.subCategories?.map(
                    (subCategory: subCategory, index) => {
                      return (
                        subCategory?.status === 1 && (
                          <li
                            key={index}
                            className="flex flex-col list-none relative sub-group"
                            onClick={() =>
                              subCategory?.innerCategories?.length
                                ? {}
                                : dispatch(
                                    setCategory([
                                      {
                                        path: category?.name,
                                        id: category?.id,
                                        name: "categoryid",
                                      },
                                      {
                                        description: subCategory?.description,
                                        path: subCategory?.name,
                                        id: subCategory?.id,
                                        name: "subCategoryid",
                                      },
                                    ])
                                  )
                            }
                          >
                            {subCategory?.innerCategories?.length ? (
                              <div
                                className={`border-0 py-5 px-[15px] text-sm decoration-none flex items-center text-[#211c50] ${
                                  subCategory?.innerCategories?.length &&
                                  "after:w-[0.35em] after:h-[0.35em] after:border-r-[0.1em] after:border-t-[0.1em] after:rotate-[135deg] after:border-[#211c50] after:ml-[0.5em] hover:visible hover:opacity-[1]"
                                }  font-semibold`}
                              >
                                <img
                                  src={subCategory?.image || CVD}
                                  alt="CVD"
                                  className="w-6 mr-[10px] align-middle"
                                />{" "}
                                {subCategory?.name}
                              </div>
                            ) : (
                              <Link
                                to={
                                  subCategory?.innerCategories?.length
                                    ? ""
                                    : "/product-category"
                                }
                                className={`border-0 py-5 px-[15px] text-sm decoration-none flex items-center text-[#211c50] ${
                                  subCategory?.innerCategories?.length &&
                                  "after:w-[0.35em] after:h-[0.35em] after:border-r-[0.1em] after:border-t-[0.1em] after:rotate-[135deg] after:border-[#211c50] after:ml-[0.5em] hover:visible hover:opacity-[1]"
                                }  font-semibold`}
                              >
                                <img
                                  src={subCategory?.image || CVD}
                                  alt="CVD"
                                  className="w-6 mr-[10px] align-middle"
                                />{" "}
                                {subCategory?.name}
                              </Link>
                            )}
                            <ul
                              className={`sub-group-hover:visible sub-group-hover:opacity-[1] bg-[#eee] min-w-[270px] z-[2147483641] p-0 flex-col whitespace-nowrap invisible opacity-0 flex  absolute lg:top-[0] md:top-0 top-[77px] lg:left-[100%] md:left-[100%] left-0`}
                            >
                              {subCategory?.innerCategories?.map(
                                (innerCategory: subCategory, index) => {
                                  return (
                                    <li
                                      key={index}
                                      className="flex flex-col list-none relative"
                                      onClick={() =>
                                        dispatch(
                                          setCategory([
                                            {
                                              path: category?.name,
                                              id: category?.id,
                                              name: "categoryid",
                                            },
                                            {
                                              path: subCategory?.name,
                                              id: subCategory?.id,
                                              name: "subCategoryid",
                                            },
                                            {
                                              path: innerCategory?.name,
                                              id: innerCategory?.id,
                                              name: "innerCategoryid",
                                              description:
                                                innerCategory?.description,
                                            },
                                          ])
                                        )
                                      }
                                    >
                                      <Link
                                        to={"/product-category"}
                                        className="border-0 py-5 px-[15px] font-semibold text-sm decoration-none flex items-center text-[#211c50]"
                                      >
                                        {innerCategory?.name}
                                      </Link>
                                    </li>
                                  );
                                }
                              )}
                            </ul>
                          </li>
                        )
                      );
                    }
                  )}
                </ul>
              </>
            ) : (
              <Link
                to={"/product-category"}
                className={`group-hover:bg-[#eee] group-hover:border-t-[3px] group-hover:border-[#211c50] py-5 px-[15px] text-sm text-[#211c50] font-normal border-t-[3px] border-transparent ${
                  category?.subCategories?.length &&
                  "after:w-[0.35em] after:h-[0.35em] after:border-r-[0.1em] after:border-t-[0.1em] after:rotate-[135deg] after:border-[#211c50] after:ml-[0.5em] hover:visible hover:opacity-[1]"
                }  flex items-center `}
              >
                {category?.name}
              </Link>
            )}
          </li>
        );
      })}
      {/* <li className="relative diamond list-none flex flex-col">
                          <Link
                            to={"/jewellery"}
                            className="py-5 px-[15px] text-sm border-t-[3px] border-transparent text-[#211c50] font-normal hover:bg-[#eee] hover:border-t-[3px] hover:border-[#211c50] flex items-center"
                          >
                            Jewellery
                          </Link>
                        </li> */}

      <li className="relative group diamond list-none flex  flex-col">
        <Link
          to={""}
          className="group-hover:bg-[#eee] group-hover:border-t-[3px] group-hover:border-[#211c50] py-5 px-[15px] text-sm text-[#211c50] font-normal border-t-[3px] border-transparent after:w-[0.35em] after:h-[0.35em] after:border-r-[0.1em] after:border-t-[0.1em] after:rotate-[135deg] flex items-center after:border-[#211c50] after:ml-[0.5em] hover:visible hover:opacity-[1]"
        >
          Knowledge
        </Link>
        <ul className="sub-menu bg-[#eee] min-w-[270px] z-[2147483641] p-0 flex-col whitespace-nowrap invisible opacity-0 flex  absolute top-[100%] group-hover:visible group-hover:opacity-[1]">
          <li className="flex flex-col list-none relative">
            <Link
              to={"/diamond-price"}
              className="border-0 py-5 px-[15px] text-sm font-semibold decoration-none flex items-center text-[#211c50]"
            >
              Diamond Price
            </Link>
          </li>
          <li className="flex flex-col list-none relative">
            <Link
              to={"/diamonds-shapes"}
              className="border-0 py-5 px-[15px] text-sm font-semibold decoration-none flex items-center text-[#211c50]"
            >
              Diamonds Shapes
            </Link>
          </li>
          <li className="flex flex-col list-none relative">
            <Link
              to={"/cs-diamond"}
              className="border-0 py-5 px-[15px] text-sm font-semibold decoration-none flex items-center text-[#211c50]"
            >
              7 C’s of Diamond
            </Link>
          </li>
        </ul>
      </li>
      <li className="relative group diamond list-none flex  flex-col">
        <Link
          to={""}
          className="group-hover:bg-[#eee] group-hover:border-t-[3px] group-hover:border-[#211c50] py-5 px-[15px] text-sm text-[#211c50] font-normal border-t-[3px] border-transparent after:w-[0.35em] after:h-[0.35em] after:border-r-[0.1em] after:border-t-[0.1em] after:rotate-[135deg] flex items-center after:border-[#211c50] after:ml-[0.5em] hover:visible hover:opacity-[1]"
        >
          About
        </Link>
        <ul className="sub-menu bg-[#eee] min-w-[270px] z-[2147483641] p-0 flex-col whitespace-nowrap invisible opacity-0 flex  absolute top-[100%] group-hover:visible group-hover:opacity-[1]">
          <li className="flex flex-col list-none relative">
            <Link
              to={"/why-us"}
              className="border-0 py-5 px-[15px] text-sm font-semibold decoration-none flex items-center text-[#211c50]"
            >
              Why Us
            </Link>
          </li>
        </ul>
      </li>
      <li className="relative diamond list-none flex flex-col">
        <Link
          to={"/product-category"}
          onClick={() =>
            dispatch(setCategory([{ name: "Shop", path: "Shop", id: "Shop" }]))
          }
          className="py-5 px-[15px] text-sm border-t-[3px] border-transparent font-normal text-[#211c50] hover:bg-[#eee] hover:border-t-[3px] hover:border-[#211c50] flex items-center"
        >
          Shop
        </Link>
      </li>
      <li className="relative diamond list-none flex flex-col">
        <Link
          to={"/contact"}
          className="py-5 px-[15px] text-sm border-t-[3px] border-transparent font-normal text-[#211c50] hover:bg-[#eee] hover:border-t-[3px] hover:border-[#211c50] flex items-center"
        >
          Contact
        </Link>
      </li>
    </>
  );

  const mobileHeaderMenu = (
    <>
      <li className="relative group">
        <Link
          to={""}
          className="py-5 px-[15px] group-hover:bg-[#eee] group-hover:border-t-[3px] group-hover:border-[#211c50] text-sm border-t-[3px] border-transparent text-[#211c50] font-normal hover:bg-[#eee] flex items-center"
        >
          Home
        </Link>
      </li>
      <li className="relative group">
        <div
          onClick={() => {
            setCategoryOpen(!categoryOpen);
            setKnowledgeOpen(false);
            setAboutOpen(false);
          }}
          className={`py-5 justify-between px-[15px] ${
            categoryOpen &&
            "bg-[#eee] border-t-[#211c50] border-t-[3px] border-[#211c50]"
          } hover:border-t-[#211c50] hover:border-t-[3px] hover:border-[#211c50] text-sm border-t-[3px] border-transparent text-[#211c50] font-normal hover:bg-[#eee] flex items-center after:w-[0.35em] after:h-[0.35em] after:border-r-[0.1em] after:border-t-[0.1em] ${
            categoryOpen && "after:rotate-[315deg]"
          } after:rotate-[135deg] after:border-[#211c50] after:ml-[0.5em]`}
        >
          Category
        </div>
      </li>
      {categories?.length > 0 &&
        categoryOpen &&
        categories?.map((category: Category, index: number) => {
          return (
            <li
              key={index}
              className={`relative group list-none flex flex-col`}
            >
              <div
                onClick={() => {
                  if (category?.subCategories?.length) {
                    setCategoryOpen(true);
                    setMenuOpen(true);
                  } else {
                    dispatch(
                      setCategory([
                        {
                          path: category?.name,
                          id: category?.id,
                          name: "categoryid",
                        },
                      ])
                    );
                    setMenuOpen(false);
                    setCategoryOpen(false);
                  }
                }}
              >
                {category?.subCategories?.length ? (
                  <>
                    <div
                      // to={category?.subCategories?.length ? "" : "/product-category"}
                      className={`bg-[#eee] justify-between ${
                        categoryOpen && "border-t-[3px]"
                      } py-5 px-[15px] text-sm text-[#211c50] font-normal ${
                        categoryOpen && "border-t-[3px]"
                      } ${
                        category?.subCategories?.length &&
                        "after:rotate-[135deg] after:border-[#211c50] after:ml-[0.5em] hover:visible hover:opacity-[1]"
                      }  flex items-center  ${
                        categoryOpen && "after:rotate-[315deg]"
                      }`}
                    >
                      {category?.name}
                    </div>
                    <ul className="bg-[#eee] p-0 flex-col whitespace-nowrap border-t-[3px]">
                      {category?.subCategories?.map(
                        (subCategory: subCategory, index) => {
                          return (
                            subCategory?.status === 1 && (
                              <li
                                key={index}
                                className="flex flex-col list-none relative sub-group"
                                onClick={() => {
                                  dispatch(
                                    setCategory([
                                      {
                                        path: category?.name,
                                        id: category?.id,
                                        name: "categoryid",
                                      },
                                      {
                                        description: subCategory?.description,
                                        path: subCategory?.name,
                                        id: subCategory?.id,
                                        name: "subCategoryid",
                                      },
                                    ])
                                  ),
                                    setMenuOpen(false);
                                  setCategoryOpen(false);
                                }}
                              >
                                {subCategory?.innerCategories?.length ? (
                                  <div
                                    className={`border-0 py-5 px-[15px] text-sm decoration-none flex items-center text-[#211c50] ${
                                      subCategory?.innerCategories?.length &&
                                      "after:w-[0.35em] after:h-[0.35em] after"
                                    } border-r-[0.1em] after:border-t-[0.1em] after:rotate-[135deg] after:border-[#211c50] after:ml-[0.5em] hover:visible hover:opacity-[1] font-semibold`}
                                  >
                                    <img
                                      src={subCategory?.image || CVD}
                                      alt="CVD"
                                      className="w-6 mr-[10px] align-middle"
                                    />{" "}
                                    {subCategory?.name}
                                  </div>
                                ) : (
                                  <Link
                                    to={
                                      subCategory?.innerCategories?.length
                                        ? ""
                                        : "/product-category"
                                    }
                                    className={`border-0 py-5 px-[15px] text-sm decoration-none flex items-center text-[#211c50] ${
                                      subCategory?.innerCategories?.length &&
                                      "after:w-[0.35em] after:h-[0.35em] after:border-r-[0.1em] after:border-t-[0.1em] after:rotate-[135deg] after:border-[#211c50] after:ml-[0.5em] hover:visible hover:opacity-[1]"
                                    }  font-semibold`}
                                  >
                                    <img
                                      src={subCategory?.image || CVD}
                                      alt="CVD"
                                      className="w-6 mr-[10px] align-middle"
                                    />{" "}
                                    {subCategory?.name}
                                  </Link>
                                )}
                                <ul
                                  className={`bg-[#eee] z-[2147483641] p-0 flex-col whitespace-nowrap flex`}
                                >
                                  {subCategory?.innerCategories?.map(
                                    (innerCategory: subCategory, index) => {
                                      return (
                                        <li
                                          key={index}
                                          className="flex flex-col list-none relative"
                                          onClick={() => {
                                            dispatch(
                                              setCategory([
                                                {
                                                  path: category?.name,
                                                  id: category?.id,
                                                  name: "categoryid",
                                                },
                                                {
                                                  path: subCategory?.name,
                                                  id: subCategory?.id,
                                                  name: "subCategoryid",
                                                },
                                                {
                                                  path: innerCategory?.name,
                                                  id: innerCategory?.id,
                                                  name: "innerCategoryid",
                                                  description:
                                                    innerCategory?.description,
                                                },
                                              ])
                                            ),
                                              setMenuOpen(false);
                                            setCategoryOpen(false);
                                          }}
                                        >
                                          <Link
                                            to={"/product-category"}
                                            className="border-0 py-5 px-[15px] font-semibold text-sm decoration-none flex items-center text-[#211c50] pl-14"
                                          >
                                            {innerCategory?.name}
                                          </Link>
                                        </li>
                                      );
                                    }
                                  )}
                                </ul>
                              </li>
                            )
                          );
                        }
                      )}
                    </ul>
                  </>
                ) : (
                  <Link
                    to={"/product-category"}
                    className={`bg-[#eee] justify-between ${
                      categoryOpen && "border-y-[3px]"
                    } py-5 px-[15px] text-sm text-[#211c50] font-normal ${
                      categoryOpen && "border-t-[3px]"
                    } ${
                      category?.subCategories?.length &&
                      "after:w-[0.35em] after:h-[0.35em] after:border-r-[0.1em] after:border-t-[0.1em] after:rotate-[135deg] after:ml-[0.5em] hover:visible hover:opacity-[1]"
                    }  flex items-center `}
                  >
                    {category?.name}
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      <li className="relative group diamond list-none flex  flex-col">
        <div
          onClick={() => {
            setKnowledgeOpen(!KnowledgeOpen);
            setCategoryOpen(false);
            setAboutOpen(false);
          }}
          className={`${
            KnowledgeOpen && "border-t-[3px] border-[#211c50] bg-[#eee]"
          }  py-5 px-[15px] text-sm text-[#211c50] font-normal after:w-[0.35em] after:h-[0.35em] after:border-r-[0.1em] after:border-t-[0.1em] after:rotate-[135deg] ${
            KnowledgeOpen && "after:rotate-[315deg]"
          } flex items-center after:border-[#211c50] after:ml-[0.5em] hover:visible hover:opacity-[1] justify-between`}
        >
          Knowledge
        </div>
        {KnowledgeOpen && (
          <ul className="sub-menu bg-[#eee] p-0 flex-col whitespace-nowrap border-t-[3px] flex">
            <li className="flex flex-col list-none relative">
              <Link
                to={"/diamond-price"}
                className="border-0 py-5 px-[15px] text-sm font-semibold decoration-none flex items-center text-[#211c50]"
              >
                Diamond Price
              </Link>
            </li>
            <li className="flex flex-col list-none relative">
              <Link
                to={"/diamonds-shapes"}
                className="border-0 py-5 px-[15px] text-sm font-semibold decoration-none flex items-center text-[#211c50]"
              >
                Diamonds Shapes
              </Link>
            </li>
            <li className="flex flex-col list-none relative">
              <Link
                to={"/cs-diamond"}
                className="border-0 py-5 px-[15px] text-sm font-semibold decoration-none flex items-center text-[#211c50]"
              >
                7 C’s of Diamond
              </Link>
            </li>
          </ul>
        )}
      </li>
      <li className="relative group diamond list-none flex  flex-col">
        <div
          onClick={() => {
            setAboutOpen(!AboutOpen);
            setKnowledgeOpen(false);
            setCategoryOpen(false);
          }}
          className={`${
            AboutOpen &&
            "border-t-[3px] border-[#211c50] bg-[#eee] after:rotate-[315deg]"
          } py-5 px-[15px] text-sm text-[#211c50] font-normal after:w-[0.35em] after:h-[0.35em] after:border-r-[0.1em] after:border-t-[0.1em] after:rotate-[135deg] flex items-center after:border-[#211c50] after:ml-[0.5em] hover:visible hover:opacity-[1] justify-between`}
        >
          About
        </div>
        {AboutOpen && (
          <ul className="sub-menu bg-[#eee] p-0 flex-col whitespace-nowrap border-t-[3px] flex">
            <li className="flex flex-col list-none relative">
              <Link
                to={"/why-us"}
                className="border-0 py-5 px-[15px] text-sm font-semibold decoration-none flex items-center text-[#211c50]"
              >
                Why Us
              </Link>
            </li>
          </ul>
        )}
      </li>
      <li className="relative diamond list-none flex flex-col">
        <Link
          to={"/product-category"}
          onClick={() =>
            dispatch(setCategory([{ name: "Shop", path: "Shop", id: "Shop" }]))
          }
          className="py-5 px-[15px] text-sm border-t-[3px] border-transparent font-normal text-[#211c50] hover:bg-[#eee] hover:border-t-[3px] hover:border-[#211c50] flex items-center"
        >
          Shop
        </Link>
      </li>
      <li className="relative diamond list-none flex flex-col">
        <Link
          to={"/contact"}
          className="py-5 px-[15px] text-sm border-t-[3px] border-transparent font-normal text-[#211c50] hover:bg-[#eee] hover:border-t-[3px] hover:border-[#211c50] flex items-center"
        >
          Contact
        </Link>
      </li>
    </>
  );

  const headerTop = (
    <div className="flex flex-wrap flex-col  items-start">
      <nav className="font-poppins">
        <div className="cursor-pointer hidden">
          <div className="w-[40px] h-[40px] my-[10px] flex items-center justify-center">
            <div className="flex justify-between flex-col">
              <div className="bg-[#404040]"></div>
              <div className="bg-[#404040]"></div>
              <div className="bg-[#404040]"></div>
            </div>
          </div>
        </div>
        <div className="">
          <ul className="flex-row p-0 m-0 list-none lg:flex sm:hidden hidden">
            {headerMenu}
          </ul>
        </div>
      </nav>
    </div>
  );

  return (
    <>
      <header>
        <div className="py-[7px] bg-[#211c50] w-full">
          <div className="container flex justify-between items-center">
            <div className="flex items-center justify-start">
              <div className="flex flex-nowrap flex-col items-start">
                <Link
                  to={""}
                  className="flex flex-wrap text-center decoration-none flex-col items-center justify-center"
                >
                  <div className="flex items-start w-full flex-row text-left">
                    <div className="flex flex-shrink-0 flex-grow-0 self-start mr-3 mb-0 mt-0">
                      <div className="text-[#fff] inline-flex rounded-[50%]">
                        <FontAwesomeIcon icon={faWhatsapp} size="xl" />
                      </div>
                    </div>
                    <div className="flex-grow-1 w-full sm:block hidden">
                      <h2 className="sm:text-[17px] text-[10px] text-[#fff] font-poppins">
                        +44 7425 380174 (24x7 Support)
                      </h2>
                      <p className="text-base mb-3 self-start m-0 hidden">
                        "Drag a button, link, or anything else into the icon box
                        to place it below the text. Lorem ipsum dolor sit amet
                        elit."
                      </p>
                      <div className="mt-5 hidden"></div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center flex-grow-1">
              <div className="flex flex-wrap flex-col">
                <div className="relative">
                  <div className="flex items-center justify-center">
                    <div className="font-arial text-xs text-left cursor-pointer lg:w-[200px] md:w-[200px] w-[130px] leading-0 mr-3 rounded-lg">
                      <Select
                        options={countries}
                        placeholder="Select a country"
                        onChange={handleCountryChange}
                        value={countries.find((it: any) => it.value === selectedCountry)}
                        isSearchable
                        className="cursor-pointer"
                      />
                    </div>
                    <div className="font-arial text-xs text-left cursor-pointer lg:w-[120px] md:w-[120px] w-[100px] leading-0 rounded-lg">
                      <Select
                        options={currencies}
                        placeholder="Select a currency"
                        className="cursor-pointer"
                        onChange={handleCurrencyChange}
                        isSearchable
                        value={currencies.find((it: any) => it.value === selectedCurrency)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full py-[18px]">
          <div className="container flex mx-auto flex-nowrap justify-between items-stretch w-full lg:px-5 md:px-4 px-4 grid grid-cols-3">
            <div className="items-center justify-start lg:flex md:hidden sm:hidden hidden">
              <div className="w-full flex flex-nowrap items-start flex-col">
                <div className="pt-2 relative text-gray-600">
                  <input
                    className="border-2 border-[#211c50] bg-[#f9f9f9] h-[44px] max-w-[220px] w-full px-5 pr-16 rounded-[10px] text-sm focus:outline-none"
                    type="search"
                    name="search"
                    placeholder="Search Product"
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="absolute right-0 top-0 mt-5 mr-4"
                    onClick={handleSearch}
                  >
                    <FontAwesomeIcon
                      icon={faSearch}
                      className="text-gray-600 h-4 w-4 fill-current"
                    />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex justify-center lg:order-1 md:order-2 sm:order-2 order-2">
              <div className="flex flex-nowrap flex-col items-start">
                <Link to={""}>
                  <img
                    src={MainLogo}
                    alt="MainLogo"
                    className="max-w-[100%] w-[241px]"
                  />
                </Link>
              </div>
            </div>
            <div className="flex items-center lg:justify-end md:justify-start justify-start lg:order-2 md:order-1 sm:order-1 order-1">
              <div
                className="lg:mx-3 md:mx-0 mx-0 relative"
                onClick={() => navigate("/wishlist")}
              >
                {wishListCount ? (
                  <div className="t-0 absolute lg:left-[17px] md:left-[10px] left-[10px] lg:bottom-[18px] md:bottom-[16px] bottom-[16px]">
                    <p className="flex h-2 w-2 items-center justify-center rounded-full bg-[#211c50] p-2 text-[10px] text-white">
                      {wishListCount}
                    </p>
                  </div>
                ) : null}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512"
                  className="lg:w-[19px] md:w-[15px] w-[15px] lg:h-[19px] md:h-[15px] h-[15px] cursor-pointer"
                >
                  <path d="M225.8 468.2l-2.5-2.3L48.1 303.2C17.4 274.7 0 234.7 0 192.8v-3.3c0-70.4 50-130.8 119.2-144C158.6 37.9 198.9 47 231 69.6c9 6.4 17.4 13.8 25 22.3c4.2-4.8 8.7-9.2 13.5-13.3c3.7-3.2 7.5-6.2 11.5-9c0 0 0 0 0 0C313.1 47 353.4 37.9 392.8 45.4C462 58.6 512 119.1 512 189.5v3.3c0 41.9-17.4 81.9-48.1 110.4L288.7 465.9l-2.5 2.3c-8.2 7.6-19 11.9-30.2 11.9s-22-4.2-30.2-11.9zM239.1 145c-.4-.3-.7-.7-1-1.1l-17.8-20c0 0-.1-.1-.1-.1c0 0 0 0 0 0c-23.1-25.9-58-37.7-92-31.2C81.6 101.5 48 142.1 48 189.5v3.3c0 28.5 11.9 55.8 32.8 75.2L256 430.7 431.2 268c20.9-19.4 32.8-46.7 32.8-75.2v-3.3c0-47.3-33.6-88-80.1-96.9c-34-6.5-69 5.4-92 31.2c0 0 0 0-.1 .1s0 0-.1 .1l-17.8 20c-.3 .4-.7 .7-1 1.1c-4.5 4.5-10.6 7-16.9 7s-12.4-2.5-16.9-7z" />
                </svg>
              </div>
              <div
                className="mx-3 relative"
                onClick={() => dispatch(setOpenCart())}
              >
                {cartCount ? (
                  <div className="t-0 absolute lg:left-[17px] md:left-[10px] left-[10px] lg:bottom-[18px] md:bottom-[16px] bottom-[16px]">
                    <p className="flex h-2 w-2 items-center justify-center rounded-full bg-[#211c50] p-2 text-[10px] text-white">
                      {cartCount}
                    </p>
                  </div>
                ) : null}
                <FontAwesomeIcon
                  icon={faCartShopping}
                  className="lg:w-[19px] md:w-[15px] w-[15px] lg:h-[19px] md:h-[15px] h-[15px] cursor-pointer"
                />
              </div>
              <div
                className="flex flex-nowrap flex-col  relative"
                onClick={() => (user?.id ? setMenu(!menu) : navigate("/login"))}
              >
                <div className="lg:justify-center md:justify-start justify-start flex flex-row w-full  items-center flex-wrap">
                  <div className="py-0 lg:pl-3 md:pl-[5px] pl-[5px] flex-col flex text-center items-center cursor-pointer">
                    {user?.image ? (
                      <img src={user?.image} className="w-8 h-8 rounded-full" />
                    ) : (
                      <FontAwesomeIcon icon={faUser} size="lg" />
                    )}
                    {/* <FontAwesomeIcon icon={faUser} size="lg" /> */}
                  </div>
                  <div className="w-[73.33%] py-0 px-3 flex-col flex text-center items-start lg:block md:hidden hidden">
                    <Link to={""}>
                      {user?.id
                        ? `${user?.firstname} ${user?.lastname}`
                        : "Login"}
                    </Link>
                  </div>
                  <div className=" py-0 px-5 flex-col flex text-center items-center"></div>
                </div>
                {menu && (
                  <div
                    x-show={menu}
                    x-transition:enter="transition ease-out duration-200"
                    x-transition:enter-start="opacity-0 scale-90"
                    x-transition:enter-end="opacity-100 scale-100"
                    x-transition:leave="transition ease-in duration-200"
                    x-transition:leave-start="opacity-100 scale-100"
                    x-transition:leave-end="opacity-0 scale-90"
                    className="absolute left-[50%] top-[70%] z-full mt-3 z-[999] w-screen max-w-[10rem] -translate-x-1/2 transform px-2 sm:px-0"
                  >
                    <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                      <div
                        className="relative grid gap-6 bg-white px-5 py-4 sm:gap-8 sm:py-4"
                        onClick={() => {
                          setMenu(false);
                          navigate("/account");
                        }}
                      >
                        <a
                          href="#"
                          className="-m-3 flex items-center rounded-lg p-3 hover:bg-gray-50"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke-width="1.5"
                            stroke="currentColor"
                            className="w-6 h-6"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                            />
                          </svg>

                          {/* <svg className="h-6 w-6 flex-shrink-0 text-template-secondary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819" />
                </svg> */}

                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-900">
                              Account
                            </p>
                          </div>
                        </a>
                      </div>
                      <div
                        className="relative grid gap-6 bg-white px-5 py-4 sm:gap-8 sm:py-4"
                        onClick={() => {
                          dispatch(handleLogout());
                          setMenu(false);
                          // navigate("/")
                        }}
                      >
                        <a
                          href="#"
                          className="-m-3 flex items-center rounded-lg p-3 hover:bg-gray-50"
                        >
                          <svg
                            className="h-5 w-5 flex-shrink-0 text-template-secondary"
                            width="15"
                            height="15"
                            viewBox="0 0 15 15"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M3 1C2.44771 1 2 1.44772 2 2V13C2 13.5523 2.44772 14 3 14H10.5C10.7761 14 11 13.7761 11 13.5C11 13.2239 10.7761 13 10.5 13H3V2L10.5 2C10.7761 2 11 1.77614 11 1.5C11 1.22386 10.7761 1 10.5 1H3ZM12.6036 4.89645C12.4083 4.70118 12.0917 4.70118 11.8964 4.89645C11.7012 5.09171 11.7012 5.40829 11.8964 5.60355L13.2929 7H6.5C6.22386 7 6 7.22386 6 7.5C6 7.77614 6.22386 8 6.5 8H13.2929L11.8964 9.39645C11.7012 9.59171 11.7012 9.90829 11.8964 10.1036C12.0917 10.2988 12.4083 10.2988 12.6036 10.1036L14.8536 7.85355C15.0488 7.65829 15.0488 7.34171 14.8536 7.14645L12.6036 4.89645Z"
                              fill="currentColor"
                              fill-rule="evenodd"
                              clip-rule="evenodd"
                            ></path>
                          </svg>
                          {/* <svg className="h-6 w-6 flex-shrink-0 text-template-secondary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819" />
                </svg> */}

                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-900">
                              Logout
                            </p>
                          </div>
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div
              className="flex items-center justify-end lg:hidden md:order-3 sm:order-3 order-3"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <FontAwesomeIcon
                icon={faBars}
                className="h-6 w-6 fill-current text-[#211c50]"
              />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center">{headerTop}</div>
      </header>
      {menuOpen && (
        <div
          className="header-menu active relative lg:hidden md:block block"
          ref={modalRef}
        >
          <div
            className="absolute top-[10px] right-[10px] z-[999999]"
            onClick={() => setMenuOpen(false)}
          >
            <FontAwesomeIcon
              icon={faClose}
              className="h-6 w-6 fill-current text-[#211c50]"
            />
          </div>
          <ul className="mt-4">{mobileHeaderMenu}</ul>
        </div>
      )}
      {/* {isScrolled && (
        <header className="fixed top-0 left-0 right-0 z-[999] bg-[#fff]">
          <div
            className="block w-full"
            style={{ boxShadow: "0 3px 5px 0 rgba(0,0,0,.15)" }}
          >
            <div className="container h-full flex flex-nowrap justify-between items-stretch">
              <div className="flex items-center justify-start">
                <div className="flex flex-nowrap flex-col items-start">
                  <Link to={""} className="py-[5px]">
                    <img
                      src={LogoShape}
                      alt="LogoShape"
                      className="max-w-[65%] w-[100px]"
                    />
                  </Link>
                </div>
              </div>
              <div className="w-[238px] flex items-center justify-center"></div>
              <div className="flex items-center justify-end">{headerTop}</div>
              <div
                className="flex items-center justify-end lg:hidden md:order-3 sm:order-3 order-3"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <FontAwesomeIcon
                  icon={faBars}
                  className="h-6 w-6 fill-current text-[#211c50]"
                />
              </div>
            </div>
          </div>
        </header>
      )} */}
      <header
        id="sticky__header"
        className={`fixed -top-full left-0 right-0 z-[999] bg-[#fff]`}
      >
        <div
          className="block w-full"
          style={{ boxShadow: "0 3px 5px 0 rgba(0,0,0,.15)" }}
        >
          <div className="container h-full flex flex-nowrap justify-between items-stretch">
            <div className="flex items-center justify-start">
              <div className="flex flex-nowrap flex-col items-start">
                <Link to={""} className="py-[5px]">
                  <img
                    src={LogoShape}
                    alt="LogoShape"
                    className="max-w-[65%] w-[100px]"
                  />
                </Link>
              </div>
            </div>
            <div className="w-[238px] flex items-center justify-center"></div>
            <div className="flex items-center justify-end">{headerTop}</div>
            <div
              className="flex items-center justify-end lg:hidden md:order-3 sm:order-3 order-3"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <FontAwesomeIcon
                icon={faBars}
                className="h-6 w-6 fill-current text-[#211c50]"
              />
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
