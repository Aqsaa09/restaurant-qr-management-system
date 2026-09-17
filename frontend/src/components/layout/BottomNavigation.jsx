import '../../assets/styles/BottomNavigation.css';

const BottomNavigation = () => {
  return (
    <div className="bottom-navigation">
      <div className="bottom-nav-container">
        {/* Add bottom navigation items here */}
        <div className="nav-item">Home</div>
        <div className="nav-item">Menu</div>
        <div className="nav-item">Profile</div>
      </div>
    </div>
  );
};

export default BottomNavigation;