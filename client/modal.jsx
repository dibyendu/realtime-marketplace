import UserForm from'./form.jsx';

class ModalForm extends React.Component {
	constructor() {
		super();
		this.state = {
			isVisible: true
		};
	}

	handleClose() {
		this.setState({ isVisible: false });
	}

	render() {
		if (!this.state.isVisible)
			return null
		
		var userInfo = {
			product: '',
			contact: '',
			email: $('#email').val(),
			price: '',
			file: '',
			image: null
		}

		return (
			<div>
				<div className='modal-box'>
					<h2>Add Product Information</h2>
					<a className='close-btn' href='#' title='Close' onClick={() => this.handleClose()}><img src='static/cross.png'/></a>
					<UserForm saveNewInfo={true} initData={userInfo} extraData={Object.assign(this.props.mapData, {
						first: $('#fname').val(),
						last: $('#lname').val(),
						ip: $('#ip').val()
					})} closeModal={() => this.handleClose()}/>
				</div>
				<div className='modal-bg' onClick={e => {
					e.preventDefault();
					this.handleClose();
				}}/>
			</div>
		)
	}
}

window.showModal = (key, mapData) => ReactDOM.render(<ModalForm key={key} mapData={mapData} />, document.getElementById('modal'))