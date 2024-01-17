import { FC, useEffect, useState } from 'react';
import KImg from '../../public/assests/Images/k1.png';
import { Button } from './ui/button';
import useApi from "@/hooks/useApi";
import { apiPath } from '@/lib/api-path';
import { useNavigate } from 'react-router-dom';

interface Category {
    id: string,
    name: string;
    description: string;
    image: string;
}

const NaturalDiamonds: FC = () => {
    const navigate = useNavigate()
    const { apiAction } = useApi()
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        getCategories()
    }, []);

    const getCategories = async () => {
        let data = await apiAction({ method: "get", url: `${apiPath?.categories?.all}?page=1&pageSize=100` })
        setCategories(data?.data?.filter((category: any) => (category?.name === "Diamonds" || category?.name === "Diamond")))
    }

    return (
        <section className='w-full'>
            <div className='container lg:px-5 md:px-5 sm:px-5 px-0 h-[100%] pb-[54px]'>
                <div className='py-0 flex flex-row items-stretch flex-wrap justify-center'>
                    {categories.map((elm, index) => {
                        return <div
                            key={index}
                            className={`lg:pt-0 md:pt-0 lg:pb-[54px] md:pb-[54px] pb-[10px] flex flex-col items-start px-0 w-full`}
                        >
                            <div className={`w-full flex lg:flex-row md:flex-row sm:flex-col-reverse flex-col-reverse items-center justify-center flex-wrap ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                                }`}>
                                <div className={`lg:w-[50%] md:w-[50%] w-full p-5 flex flex-nowrap flex-col items-start`}>
                                    <h4 className='text-[22px] font-poppins text-[#211c50] font-semibold mb-[30px]'>{elm.name}</h4>
                                    <div className='text-[#000] font-poppins font-normal mb-[30px]'>{elm.description}</div>
                                    <Button
                                        variant={'secondary'}
                                        className='mt-[25px] font-poppins text-[17px] font-medium rounded-[10px] py-2 px-[25px] text-[#ffff] bg-[#211c50] border-[1px] border-[#fff] outline-none hover:text-[#211c50] hover:border-[#211c50]'
                                        onClick={() => navigate(`/product-category`)}
                                    >
                                        Purchase Now
                                    </Button>
                                </div>
                                <div className={`lg:w-[50%] md:w-[50%] w-full p-5 flex flex-nowrap flex-col items-start`}>
                                    <img src={elm.image} alt={elm.name} className='max-w-[100%] w-full h-[293.88px]' />
                                    <div className='w-full hidden'></div>
                                </div>
                            </div>
                        </div>
                    })}
                </div>
                <div className='flex w-full flex-row items-stretch justify-center flex-wrap'>
                    <div className='p-5 flex flex-nowrap flex-col items-center'>
                        <h1 className='font-poppins w-full text-center text-[#211c50] text-[35px] font-bold'>Making of Diamonds</h1>
                        <img src={KImg} alt='KImg' className='max-w-[100%] w-full h-auto' />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default NaturalDiamonds;
