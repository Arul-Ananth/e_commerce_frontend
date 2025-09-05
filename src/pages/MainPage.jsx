import React from "react";
import Body from "../components/Body.jsx";

function MainPage() {
    const [drawerOpen, setDrawerOpen] = React.useState(false);
    const [selectedCategory, setSelectedCategory] = React.useState("All");

    const toggleDrawer = () => {
        setDrawerOpen(prev => !prev);
    };

    return (
        <Body
            drawerOpen={drawerOpen}
            toggleDrawer={toggleDrawer}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
        />
    );
}

export default MainPage;
