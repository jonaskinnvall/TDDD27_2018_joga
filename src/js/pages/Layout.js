import React from "react";

import Header from "../components/Header"
import Main from "../components/Main"
import Footer from "../components/Footer"

export default class Layout extends React.Component {
	constructor(){
		super();
		this.state = {title: "välkommen"};

	}


	changeTitle(title){
		this.setState({title});
	}


	render() {
		
		const{location} = this.props;
		
		return(
        	<div>
            	<Header changeTitle={this.changeTitle.bind(this)} title={this.state.title} location = {location}/>

				<Main />
				<hr/>
                <Footer /> 
            </div>
        );
    };
};
 