import { useNav } from "../context/NavContext";

const Unauthorized = () => {
  const { collapsed } = useNav();
  const navWidth = collapsed ? "4rem" : "14rem";

  return (
    <div style={{ marginLeft: navWidth, transition: "margin-left 200ms ease" }} className="p-8">
      <h2 className="text-xl font-bold text-red-600">Unauthorized</h2>
      <p>You don't have permission to access this page.</p>
    </div>
  );
};

export default Unauthorized;