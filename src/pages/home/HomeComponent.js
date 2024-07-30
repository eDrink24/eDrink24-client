import "./HomeComponent.css";

function HomeComponent() {

    const token = localStorage.getItem("jwtAuthToken");
    console.log(token);

    return (
        <>
            <h2>main</h2>
        </>

    );
}

export default HomeComponent;
