
import { Link } from 'react-router'

const Logo = () => {
    return (
        <Link to={'/'}>
            <img src="/assets/images/Qiyou logo.png" alt="logo" className="h-10 w-auto" />
        </Link>
    )
}

export default Logo
