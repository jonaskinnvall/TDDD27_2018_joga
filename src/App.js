import React, { useEffect, useState } from 'react';
import { Router, Route, Switch, Link, NavLink } from 'react-router-dom';
import { Nav, Navbar, Container, Row, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import history from './history';
import { useAuth0 } from './Auth/Auth';
import { setUser } from './actions/users';
import { fetchItems, addItem } from './actions/items';

// Import App.css and components
import './css/App.css';
import Home from './components/Home';
import Categories from './components/Categories';
import Profile from './components/Profile';
import PrivateRoute from './components/PrivRoute';
import FormModal from './components/FormModal';

function App() {
    // Auth0 hook
    const {
        loading,
        isAuthenticated,
        loginWithRedirect,
        user,
        logout,
        getTokenSilently,
    } = useAuth0();

    // React-Redux hooks
    const dispatch = useDispatch();
    const userState = useSelector((state) => state.userState);
    const itemState = useSelector((state) => state.itemState);
    const [ModalShow, setModalShow] = useState(false);
    const [FormType, setFormType] = useState();
    const [itemReq, setItemReq] = useState({
        title: '',
        cat: '',
        desc: '',
        price: '',
        image: { imageURL: null, imageID: null },
    });

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

    // Clear form inputs after closing modal
    useEffect(() => {
        if (!ModalShow)
            setItemReq({
                title: '',
                cat: '',
                desc: '',
                price: '',
                image: { imageURL: null, imageID: null },
            });
    }, [ModalShow]);

    // Dispatch item after image has been converted to base64 string if image is included
    useEffect(() => {
        if (typeof itemReq.image.imageURL === 'string' && !FormType) {
            dispatchItem();
            setModalShow(false);
        }
    }, [itemReq.image.imageURL]);

    // Function to dispatch new item
    const dispatchItem = async () => {
        let token = await getTokenSilently();
        let userUpdate = { ...userState };
        await dispatch(addItem(userUpdate, itemReq, token));
    };

    // Read file from form and convert to base64 string
    const readFile = () => {
        const reader = new FileReader();
        const image = itemReq.image.imageURL;

        reader.onloadend = () =>
            setItemReq({
                ...itemReq,
                image: { ...itemReq.image, imageURL: reader.result },
            });
        reader.readAsDataURL(image);
    };

    // Check if image is uploaded with item, if it is call readFile,
    // if not go directly to dispatch item
    const postItem = async (e) => {
        e.preventDefault();

        if (itemReq.image.imageURL) {
            readFile();
        } else {
            dispatchItem();
            setModalShow(false);
        }
        setFormType();
    };

    return (
        <Router history={history}>
            {loading ? (
                <div> Loading... </div>
            ) : (
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
                                    <Nav.Link as={NavLink} to="/categories">
                                        {' '}
                                        Categories{' '}
                                    </Nav.Link>
                                </Nav>
                                <Nav className="ml-auto">
                                    {isAuthenticated && userState.image ? (
                                        <Nav>
                                            <Nav.Link
                                                onClick={() => (
                                                    setModalShow(true),
                                                    setFormType('addItem')
                                                )}
                                            >
                                                Add Item
                                            </Nav.Link>
                                            {FormType === 'addItem' && (
                                                <FormModal
                                                    formType={FormType}
                                                    confirm={postItem}
                                                    req={itemReq}
                                                    onReq={setItemReq}
                                                    show={ModalShow}
                                                    onHide={() => (
                                                        setModalShow(false),
                                                        setFormType()
                                                    )}
                                                />
                                            )}
                                            <Nav.Link
                                                as={NavLink}
                                                to="/profile"
                                            >
                                                {user.given_name}{' '}
                                                <img
                                                    src={
                                                        userState.image.imageURL
                                                    }
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
                                                    connection: 'google-oauth2',
                                                })
                                            }
                                        >
                                            Log In
                                        </Nav.Link>
                                    )}
                                </Nav>
                            </Navbar.Collapse>
                        </Navbar>
                    </div>
                    <div className="App-main">
                        <Switch>
                            <Route
                                exact
                                path="/"
                                render={(props) => <Home loading={loading} />}
                            />
                            <Route path="/categories" component={Categories} />
                            <PrivateRoute
                                path="/profile"
                                render={(props) => (
                                    <Profile
                                        {...props}
                                        post={postItem}
                                        itemReq={itemReq}
                                        setItemReq={setItemReq}
                                        ModalShow={ModalShow}
                                        setModalShow={setModalShow}
                                        FormType={FormType}
                                        setFormType={setFormType}
                                    />
                                )}
                            />
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
                                <Col>TDDD27 - Advanced Web Programming</Col>
                            </Row>
                        </Container>
                    </div>
                </div>
            )}
        </Router>
    );
}
export default App;
