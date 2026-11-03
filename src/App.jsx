
import StockRow from './components/StockRow'

function App() {

  return (
    <div>   
      <StockRow symbol="AAPL" name="Apple Inc." shares={10} value="$150.00" change="+2.5%" isPositive={true}  />
    </div>
  )
}

export default App
