import React from 'react';
import { useSelector } from 'react-redux';
import { Row } from 'react-bootstrap';

// Import components
import ItemGrid from './ItemGrid';
import '../css/ItemCard.css';

const Home = () => {
    const itemState = useSelector((state) => state.itemState);

    // Function to get the most liked items
    const featuredItems = (itemsFromState) => {
        let items = itemsFromState
            .sort((a, b) => {
                return b.stars - a.stars;
            })
            .slice(0, 3);

        return items;
    };

    return (
        <>
            {!Array.isArray(itemState) || !itemState.length ? (
                <Row className="empty-row">
                    <h2>There are no items added to the site</h2>
                </Row>
            ) : (
                <>
                    <ItemGrid
                        items={featuredItems([...itemState])}
                        title={'Featured Items'}
                        rowLength={4}
                        page={'feat'}
                    />

                    <ItemGrid
                        items={[...itemState]}
                        title={'All Items'}
                        rowLength={4}
                    />
                </>
            )}
        </>
    );
};

export default Home;
