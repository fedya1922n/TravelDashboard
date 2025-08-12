import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { AchievementProvider } from "./contexts/AchievementContext";
import { ProfileProvider } from "./contexts/ProfileContext";
import { useServiceWorker } from "./hooks/useServiceWorker";
import NotificationContainer from "./components/Notifications/NotificationContainer";
import TravelDashboard from "./components/Main/TravelDashboard";
import InfoPage from "./components/Info/Info";
import AllAttractionsPage from './components/Info/AllAttractionsPage';
import AllRecommendationsPage from './components/Info/AllRecommendationsPage';
import ProfilePage from './components/Profile/ProfilePage';
import ErrorPage from './components/Error/ErrorPage';

function App() {
  useServiceWorker();
  
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AchievementProvider>
          <ProfileProvider>
            <BrowserRouter>
              <NotificationContainer />
              <Routes>
                <Route path="/" element={<TravelDashboard />} />
                <Route path="/info" element={<InfoPage />} />
                <Route path="/all-attractions" element={<AllAttractionsPage />} />
                <Route path="/all-recommendations" element={<AllRecommendationsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/error" element={<ErrorPage />} />
              </Routes>
            </BrowserRouter>
          </ProfileProvider>
        </AchievementProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;