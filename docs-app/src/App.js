import './App.css';
import { Switch, Route, Redirect } from 'react-router-dom';
import Editor from './components/Editor';
import {v4 as uuidV4} from 'uuid'
function App() {
  return (
    <div>
      <Switch>
        <Route path="/" exact>
          <Redirect to={`/${uuidV4()}`}/>
        </Route>
        <Route path="/:id" component={Editor}/>
      </Switch>
    </div>
  );
}

export default App;
