import { useRouter } from '@/hooks/useRouter';
import { useFavorites } from '@/hooks/useFavorites';
import { useListings } from '@/hooks/useListings';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { HomePage } from '@/pages/HomePage';
import { MarketplacePage } from '@/pages/MarketplacePage';
import { ProductDetailPage } from '@/pages/ProductDetailPage';
import { FarmerProfilePage } from '@/pages/FarmerProfilePage';
import { ListProducePage } from '@/pages/ListProducePage';
import { BuyerEnquiryPage } from '@/pages/BuyerEnquiryPage';
import { FavoritesPage } from '@/pages/FavoritesPage';
import { TipsPage } from '@/pages/TipsPage';
import { AboutPage } from '@/pages/AboutPage';
import { ModerationPage } from '@/pages/ModerationPage';
import { demoFarmers } from '@/data';

function App() {
  const { route, navigate } = useRouter();
  const { favorites, toggleFavorite, isFavorite, storageAvailable } = useFavorites();
  const { allProduce, addListing, removeListing, restoreListing, getProduceById, removedIds } = useListings();

  const getFarmerById = (id: string) => demoFarmers.find(f => f.id === id);

  const renderPage = () => {
    switch (route.name) {
      case 'home':
        return <HomePage navigate={navigate} allProduce={allProduce} isFavorite={isFavorite} toggleFavorite={toggleFavorite} />;
      case 'marketplace':
        return <MarketplacePage navigate={navigate} allProduce={allProduce} isFavorite={isFavorite} toggleFavorite={toggleFavorite} />;
      case 'product':
        return <ProductDetailPage navigate={navigate} produce={getProduceById(route.id)} isFavorite={isFavorite} toggleFavorite={toggleFavorite} />;
      case 'farmer':
        return <FarmerProfilePage navigate={navigate} farmer={getFarmerById(route.id)} allProduce={allProduce} isFavorite={isFavorite} toggleFavorite={toggleFavorite} />;
      case 'list-produce':
        return <ListProducePage navigate={navigate} addListing={addListing} />;
      case 'enquiry':
        return <BuyerEnquiryPage navigate={navigate} produce={getProduceById(route.id)} />;
      case 'favorites':
        return <FavoritesPage navigate={navigate} allProduce={allProduce} favorites={favorites} isFavorite={isFavorite} toggleFavorite={toggleFavorite} storageAvailable={storageAvailable} />;
      case 'tips':
        return <TipsPage />;
      case 'about':
        return <AboutPage navigate={navigate} />;
      case 'moderation':
        return <ModerationPage allProduce={allProduce} removeListing={removeListing} restoreListing={restoreListing} removedIds={removedIds} />;
      default:
        return <HomePage navigate={navigate} allProduce={allProduce} isFavorite={isFavorite} toggleFavorite={toggleFavorite} />;
    }
  };

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <Header route={route} navigate={navigate} favoritesCount={favorites.length} />
      <main className="flex-1">
        {renderPage()}
      </main>
      <Footer navigate={navigate} />
    </div>
  );
}

export default App;
