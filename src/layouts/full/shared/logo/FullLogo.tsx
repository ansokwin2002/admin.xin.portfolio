






import { Link } from "react-router-dom";


const FullLogo = () => {
  return (
    <>
      {/* Dark Logo   */}
      <img src="/assets/images/Qiyou logo.png" alt="logo" className="block dark:hidden rtl:scale-x-[-1] h-10 w-auto" />
      {/* Light Logo  */}
      <img src="/assets/images/Qiyou logo.png" alt="logo" className="hidden dark:block rtl:scale-x-[-1] h-10 w-auto" />
    </>
  );
};

export default FullLogo;
