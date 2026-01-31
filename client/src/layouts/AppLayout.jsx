import Navbar from "../components/Navbar"

const AppLayout = ({ children }) => {
  return (
    <>
        <Navbar />
        <main>{children}</main>
    </>
  )
}

export default AppLayout