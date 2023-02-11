import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const Stats = () => {
  const nav = useNavigate();

  useEffect(() => {
    if (localStorage.logged === 'false') {
      nav('/');
    }
    return ()=>{}
  }, []);
  return (
    <section className="stats page">
      Stats Page
    </section>
  )
}