import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { Container, Col, Row, Button, Image } from 'react-bootstrap';

import { useAuth0 } from '../Auth/Auth';
import { editUser, editAllUsers, deleteUserDB } from '../actions/users';
import { deleteManyItems } from '../actions/items';
import ItemGrid from './ItemGrid';
import FormModal from './FormModal';

import '../css/Profile.css';

const Profile = ({
    post,
    itemReq,
    setItemReq,
    ModalShow,
    setModalShow,
    FormType,
    setFormType,
}) => {
    const { loading, logout, getTokenSilently } = useAuth0();
    const dispatch = useDispatch();
    const userState = useSelector((state) => state.userState);
    const itemState = useSelector((state) => state.itemState);
    const [userInfo, setUserInfo] = useState({
        favCat: '',
        image: { imageURL: null, imageID: null },
    });

    // Clear form inputs after closing modal
    useEffect(() => {
        if (!ModalShow)
            setUserInfo({
                favCat: '',
                image: { imageURL: null, imageID: null },
            });
    }, [ModalShow]);

    // Dispatch item after image has been converted to base64 string if image is included
    useEffect(() => {
        if (typeof userInfo.image.imageURL === 'string' && !FormType) {
            dispatchUser();
            setModalShow(false);
        }
    }, [userInfo.image.imageURL]);

    // Function to dispatch user update
    const dispatchUser = async () => {
        let token = await getTokenSilently();
        let userUpdate = { ...userState };
        userUpdate = {
            ...userUpdate,
            favCat: userInfo.favCat,
            image: userInfo.image,
        };

        await dispatch(editUser(userUpdate, token));
    };

    // Read file from form and convert to base64 string
    const readFile = () => {
        const reader = new FileReader();
        const image = userInfo.image.imageURL;

        reader.onloadend = () =>
            setUserInfo({
                ...userInfo,
                image: { ...userInfo.image, imageURL: reader.result },
            });
        reader.readAsDataURL(image);
    };

    // Check if image is uploaded with user edit, if it is call readFile,
    // if not go directly to dispatch user
    const editUserInfo = async (e) => {
        e.preventDefault();

        if (typeof userInfo.image.imageURL === 'object') {
            readFile();
        } else {
            dispatchUser();
            setModalShow(false);
        }
        setFormType();
    };

    // Get user and items and dispatch deleteUserDB
    // Then logout
    const deleteUser = async () => {
        let token = await getTokenSilently();
        let user = { ...userState };
        let items = [...itemState];
        await dispatch(deleteUserDB(user, items, token));
        setModalShow(false);
        setFormType();
        setTimeout(logout(), 750);
    };

    // Function to delete all users items if they want
    // Get user and it's posted items, make updates
    // to user's nrItems and posted and dispatch editUser
    // folllowd by deleteManyItems then editAllUsers
    const deleteMyItems = async () => {
        let token = await getTokenSilently();
        let user = { ...userState };
        let items = [...itemState];
        let itemsToDelete = user.postedItems;
        user.nrItems = 0;
        user.postedItems = user.postedItems.filter(
            (item) => !itemsToDelete.includes(item)
        );
        let updatedItems = items.filter(
            (item) => !itemsToDelete.includes(item._id)
        );

        await dispatch(editUser(user, token));
        await dispatch(
            deleteManyItems(itemsToDelete, updatedItems, token, user)
        );
        await dispatch(editAllUsers(user, token, itemsToDelete));
        setModalShow(false);
        setFormType();
    };

    return (
        <>
            {loading || !userState || !userState.creationDate ? (
                <div> Loading... </div>
            ) : (
                <Container className="cont" fluid>
                    <Row className="prof-row">
                        <Col className="user-col" xs={true}>
                            <div className="prof-img-div">
                                <Image
                                    className="prof-img"
                                    src={userState.image.imageURL}
                                    rounded
                                />
                            </div>
                            <div className="info-div">
                                <h4 width="auto">{userState.name}</h4>
                                <p>Posted items: {userState.nrItems}</p>

                                {!Array.isArray(userState.starredItems) ||
                                !userState.starredItems.length ? (
                                    <p>Starred items: 0</p>
                                ) : (
                                    <p>
                                        Starred items:{' '}
                                        {userState.starredItems.length}
                                    </p>
                                )}
                                {!userState.favCat ? (
                                    <p>Favorite category: None chosen</p>
                                ) : (
                                    <p>
                                        {' '}
                                        Favorite category: {userState.favCat}
                                    </p>
                                )}
                                <p>
                                    Joined:{' '}
                                    {userState.creationDate.split('T')[0]}
                                </p>
                                <Row className="btn-row">
                                    <Col>
                                        <Button
                                            variant="info"
                                            onClick={() => (
                                                setModalShow(true),
                                                setFormType('addItemProfile')
                                            )}
                                        >
                                            Add Item
                                        </Button>
                                        {FormType === 'addItemProfile' && (
                                            <FormModal
                                                formType={FormType}
                                                confirm={post}
                                                req={itemReq}
                                                onReq={setItemReq}
                                                show={ModalShow}
                                                onHide={() => (
                                                    setModalShow(false),
                                                    setFormType()
                                                )}
                                            />
                                        )}
                                    </Col>
                                    <Col>
                                        <Button
                                            variant="info"
                                            onClick={() => (
                                                setModalShow(true),
                                                setFormType('editUser'),
                                                setUserInfo({
                                                    ...userInfo,
                                                    favCat: userState.favCat,
                                                    image: userState.image,
                                                })
                                            )}
                                        >
                                            Edit user
                                        </Button>
                                        {FormType === 'editUser' && (
                                            <FormModal
                                                formType={FormType}
                                                confirm={editUserInfo}
                                                deleteFunc={deleteUser}
                                                deleteItems={deleteMyItems}
                                                req={userInfo}
                                                onReq={setUserInfo}
                                                show={ModalShow}
                                                onHide={() => (
                                                    setModalShow(false),
                                                    setFormType()
                                                )}
                                            />
                                        )}
                                    </Col>
                                </Row>
                            </div>
                        </Col>
                        <Col xs={9}>
                            {!Array.isArray(userState.postedItems) ||
                            !userState.postedItems.length ? (
                                <Row className="empty-row">
                                    <h2>You have not posted any items yet!</h2>
                                </Row>
                            ) : (
                                <ItemGrid
                                    items={[
                                        ...itemState.filter((item) =>
                                            userState.postedItems.includes(
                                                item._id
                                            )
                                        ),
                                    ]}
                                    title={'Your items'}
                                    rowLength={3}
                                />
                            )}

                            {!Array.isArray(userState.starredItems) ||
                            !userState.starredItems.length ? (
                                <Row className="empty-row">
                                    {' '}
                                    <h2>You have not starred any items yet!</h2>
                                </Row>
                            ) : (
                                <ItemGrid
                                    items={[
                                        ...itemState.filter((item) =>
                                            userState.starredItems.includes(
                                                item._id
                                            )
                                        ),
                                    ]}
                                    title={'Your favorite items'}
                                    rowLength={3}
                                />
                            )}
                        </Col>
                    </Row>
                </Container>
            )}
        </>
    );
};

export default Profile;

Profile.propTypes = {
    post: PropTypes.func.isRequired,
    itemReq: PropTypes.object.isRequired,
    setItemReq: PropTypes.func.isRequired,
    ModalShow: PropTypes.bool.isRequired,
    setModalShow: PropTypes.func.isRequired,
    FormType: PropTypes.string,
    setFormType: PropTypes.func.isRequired,
};
