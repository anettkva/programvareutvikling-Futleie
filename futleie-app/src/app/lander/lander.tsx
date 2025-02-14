import LogIn from '../login/page';


const Lander: React.FC = () => {
    return (
        <div className="flex h-screen">
            <div className="flex-1 bg-black flex flex-col justify-start items-center pt-8">
                <img src="/futleielogo2.png" alt="Futleie Logo" className="w-60" />
            </div>
            <div className="flex-1 flex justify-center items-center">
                <LogIn />
            </div>
        </div>
    );    
}

export default Lander;
