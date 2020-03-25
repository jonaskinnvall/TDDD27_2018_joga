import React, { useEffect } from 'react';
import { Router, Route, Switch, Link, NavLink } from 'react-router-dom';
import {
    Nav,
    Navbar,
    Button,
    Form,
    FormControl,
    Container,
    Row,
    Col
} from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import history from './history';
import { useAuth0 } from './Auth/Auth';
import { setUser } from './actions/users';
import { fetchItems } from './actions/items';

// Import App.css and components
import './css/App.css';
import Home from './components/Home';
import Featured from './components/Featured';
import Profile from './components/Profile';
import PrivateRoute from './components/PrivRoute';

function App() {
    // Auth0 hook
    const {
        loading,
        isAuthenticated,
        loginWithRedirect,
        user,
        logout
    } = useAuth0();

    // React-Redux hooks
    const dispatch = useDispatch();
    const userState = useSelector(state => state.userState.user);
    const itemState = useSelector(state => state.itemState.items);

    // Re-render when loading from Auth0 changes
    // and dispatch user to DB and redux state
    // followed by fetching all items from the DB
    useEffect(() => {
        const setUserState = async () => {
            await dispatch(setUser(user));
        };
        if (!loading) {
            setUserState();

            if (!Array.isArray(itemState) || !itemState.length) {
                dispatch(fetchItems());
            }
        }
    }, [loading]);

    return (
        <Router history={history}>
            {!loading ? (
                <div className="App">
                    <div className="App-header">
                        <Navbar
                            collapseOnSelect
                            expand="md"
                            bg="info"
                            variant="dark"
                        >
                            <Navbar.Brand as={Link} to="/">
                                <strong>JoGa</strong>
                            </Navbar.Brand>
                            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                            <Navbar.Collapse id="responsive-navbar-nav">
                                <Nav className="mr-auto">
                                    <Nav.Link as={NavLink} to="/featured">
                                        {' '}
                                        Featured{' '}
                                    </Nav.Link>
                                </Nav>
                                <Nav className="mx-auto">
                                    <Form inline>
                                        <FormControl
                                            type="text"
                                            placeholder="Search"
                                            className="mr-sm-2"
                                        />
                                        <Button variant="outline-light">
                                            Search
                                        </Button>
                                    </Form>
                                </Nav>
                                <Nav className="ml-auto">
                                    {isAuthenticated && userState ? (
                                        <Nav>
                                            <Nav.Link
                                                as={NavLink}
                                                to="/profile"
                                            >
                                                {user.given_name}{' '}
                                                <img
                                                    src={userState.image}
                                                    alt="Profile"
                                                />
                                            </Nav.Link>
                                            <Nav.Link onClick={() => logout()}>
                                                Log Out
                                            </Nav.Link>
                                        </Nav>
                                    ) : (
                                        <Nav.Link
                                            onClick={() =>
                                                loginWithRedirect({
                                                    connection: 'google-oauth2'
                                                })
                                            }
                                        >
                                            Log in
                                        </Nav.Link>
                                    )}
                                </Nav>
                            </Navbar.Collapse>
                        </Navbar>
                    </div>
                    <div className="App-main">
                        <Switch>
                            <Route exact path="/" component={Home} />
                            <Route path="/featured" component={Featured} />
                            <PrivateRoute path="/profile" component={Profile} />
                        </Switch>
                    </div>
                    <div className="App-footer">
                        <hr />
                        <Container fluid>
                            <Row>
                                <Col>
                                    <p>Jonas Kinnvall</p>
                                </Col>
                                <Col>
                                    <p>
                                        <a href="mailto:jonki910@student.liu.se">
                                            jonki910@student.liu.se
                                        </a>
                                    </p>
                                </Col>
                                <Col>TDDD27 - Advanced Web programming</Col>
                            </Row>
                        </Container>
                    </div>
                </div>
            ) : (
                <div> Loading... </div>
            )}
        </Router>
    );
}
export default App;
