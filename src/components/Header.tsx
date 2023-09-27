import Image from "next/image";

export const Header = () => {
  return (
    <header
      style={{
        width: "100%",
        backgroundColor: "rgb(203 203 203)",
        position: "fixed",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        paddingTop: "0.5rem",
        paddingBottom: "0.5rem",
      }}
    >
      <Image
        src="/connpath-logo.png"
        height={40}
        width={300}
        alt="logo"
        style={{ objectFit: "contain" }}
      />
    </header>
  );
};
