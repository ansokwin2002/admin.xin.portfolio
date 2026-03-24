import { TopCards } from "src/components/dashboards/modern/TopCards";
import { Footer } from "src/components/dashboards/modern/Footer";
import ProfileWelcome from "src/components/dashboards/modern/ProfileWelcome";
import SalesOverview from "src/components/dashboards/modern/SalesOverview";

const Moderndash = () => {
    return (
        <>
            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12">
                    <ProfileWelcome />
                </div>
                <div className="col-span-12">
                    <TopCards />
                </div>
                <div className="lg:col-span-12 col-span-12 flex">
                    <SalesOverview />
                </div>
                <div className="col-span-12">
                    <Footer />
                </div>
            </div>

        </>
    );
};

export default Moderndash;