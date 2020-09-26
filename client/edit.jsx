import UserForm from'./form.jsx';

class EditForm extends React.Component {
	constructor() {
		super();
		this.state = {
			showForm: true,
			responseMessage: {}
		}
	}

	handleRemove(e) {
		e.preventDefault();
		var that = this;
		if (confirm('Are you sure ?')) {
			$.ajax({
				type: 'POST',
				url: '/delete',
				data: JSON.stringify({id: this.props.data['_id']}),
				contentType: 'application/json; charset=utf-8',
				dataType: 'json'
			}).done(function(data, textStatus, jqXHR) {
				that.setState({ showForm: false, responseMessage: data })
				setTimeout(() => {
					window.location.href = '/'
				}, 2000)
			});
		}
	}

	render() {	
		var userInfo = {
				product: this.props.data.product,
				contact: this.props.data.contact,
				email: this.props.data.email,
				price: this.props.data.price,
				image: this.props.data.image,
				file: this.props.data.image_name,
			},
			mapInfo = {
				first: this.props.data.first,
				last: this.props.data.last,
				latitude: this.props.data.latitude,
				longitude: this.props.data.longitude,
				map_x: this.props.data.map_x,
				map_y: this.props.data.map_y,
				'_id': this.props.data['_id'],
				ip: this.props.data.ip
			}

		let response = this.state.responseMessage,
			responseDOM = null

		if (this.state.showForm)
			responseDOM = (
				<div>
					<UserForm saveNewInfo={false} initData={userInfo} extraData={mapInfo}>
						<button className='removeBtn' onClick={(e) => this.handleRemove(e)}>Delete</button>
					</UserForm>
				</div>
			)
		else
			responseDOM = (
				<div style={{textAlign: 'center'}}>
					<h3>{response['success'] ? 'Success' : 'Failure'}</h3>
					<p>{response['success'] ? response['success'] : response['failure']}</p>
				</div>
			)

		return responseDOM
	}
}

ReactDOM.render(<EditForm data={userData} />, document.getElementById('edit'))