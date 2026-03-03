







const FullLogo = ({ className }: { className?: string }) => {
  const logoClass = className || "h-10 w-auto";
  return (
    <>
      {/* Dark Logo   */}
      <img src="/assets/images/Qiyou logo.png" alt="logo" className={`block dark:hidden rtl:scale-x-[-1] ${logoClass}`} />
      {/* Light Logo  */}
      <img src="/assets/images/Qiyou logo.png" alt="logo" className={`hidden dark:block rtl:scale-x-[-1] ${logoClass}`} />
    </>
  );
};

export default FullLogo;
