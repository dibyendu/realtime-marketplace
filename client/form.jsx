export default class UserForm extends React.Component {
	constructor(props) {
		super(props);
		this.regex = {
			name: /^[a-zA-Z 0-9_\-#]{8,40}$/,
			phone: /^([0-9]{3})[- ]?([0-9]{3})[- ]?([0-9]{4})$/,
			price: /^([0-9]*)(\.[0-9]+|[0-9]*)$/
		};
		this.state = {
			product: props.initData.product,
			contact: props.initData.contact,
			email: props.initData.email,
			price: props.initData.price,
			file: props.initData.file,
			file_data: props.initData.image,
			isSubmitted: false,
			submissionResponse: {}
		}
		// This binding is necessary to make `this` work in the callback
		this.submitUserData = this.submitUserData.bind(this);
	}

	validate() {
		// true means invalid, so our conditions got reversed
		return {
			product: !(this.state.product.length === 0 || this.regex.name.test(this.state.product)),
			contact: !(this.state.contact.length === 0 || this.regex.phone.test(this.state.contact)),
			price: !(this.state.price.length === 0 || (this.regex.price.test(this.state.price) && parseFloat(this.state.price) > 0)),
			file: !(this.state.file.length !== 0)
		}
	}

	submitUserData(userData, extraData) {
		Object.assign(userData, extraData)
		let that = this
		if (that.props.saveNewInfo)
			$.ajax({
				type: 'POST',
				url: '/save',
				data: JSON.stringify(userData),
				contentType: 'application/json; charset=utf-8',
				dataType: 'json'
			}).done(function(data, textStatus, jqXHR) {
				that.setState({ isSubmitted: true, submissionResponse: data })
			})
		else
			$.ajax({
				type: 'POST',
				url: '/update',
				data: JSON.stringify(userData),
				contentType: 'application/json; charset=utf-8',
				dataType: 'json'
			}).done(function(data, textStatus, jqXHR) {
				that.setState({ isSubmitted: true, submissionResponse: data })
				setTimeout(() => {
					window.location.href = '/'
				}, 2000)
			})
	}

	canBeSubmitted() {
		const errors = this.validate();
		const isDisabled = Object.keys(errors).some(x => errors[x]) || Object.keys(errors).some(x => this.state[x].length === 0);
		return !isDisabled;
	}

	render() {
		const errors = this.validate(),
			  isDisabled = Object.keys(errors).some(x => errors[x]) || Object.keys(errors).some(x => this.state[x].length === 0);

		const shouldMarkError = (field) => {
			const hasError = errors[field];
			return hasError;
		}

		const response = this.state.submissionResponse;

		let responseDOM = null;

		if (response['success']) {
			if (this.props.saveNewInfo) {
				addItem(response['success'])
				setTimeout(() => {
					this.props.closeModal()
				}, 1000)
			}
			else {
				responseDOM = <p>{response['success']}</p>
				setTimeout(() => {
					window.location.href = '/'
				}, 2000)
			}
		}
		else
			responseDOM = <p>{response['failure'] ? response['failure'] : ''}</p>

		return (
			<div id='user-form'>
				<div className={this.state.isSubmitted ? 'submission-status show' : 'submission-status hidden'}>
					<h3>{this.state.submissionResponse['success'] ? 'Success' : 'Failure'}</h3>
					{responseDOM}
				</div>
				<form className={this.state.isSubmitted ? 'hide' : ''} onSubmit={e => {
						e.preventDefault();
						if (!this.canBeSubmitted())
							return;
						this.submitUserData(this.state, this.props.extraData);
					}
				}>
					<input
						className={shouldMarkError('product') ? 'error' : ''}
						type='text'
						placeholder='Product Name (min 8 chars)'
						value={this.state.product}
						onChange={e => this.setState({ product: e.target.value })}
					/>
					<input
						type='text'
						value={this.state.email}
						disabled
					/>
					<input
						className={shouldMarkError('contact') ? 'error' : ''}
						type='text'
						placeholder='10 Digit Contact Number'
						value={this.state.contact}
						onChange={e => this.setState({ contact: e.target.value })}
					/>
					<input
						className={shouldMarkError('price') ? 'error' : ''}
						type='text'
						placeholder='Selling price in $'
						value={this.state.price}
						onChange={e => this.setState({ price: e.target.value })}
					/>
					<input
						type='file'
						accept='image/*'
						value={this.state.file}
						onChange={event => {
							if (event.target.value !== '' && event.target.files[0].size > 2000000) {
								alert('File size can NOT be more than 2MB')
								this.setState({ file: '', file_data: null })
								return
							}
							if (event.target.value !== '') {
								let reader = new FileReader(), that = this
								reader.readAsDataURL(event.target.files[0])
								this.setState({ file: event.target.value })
								reader.addEventListener('load', () => {
									that.setState({ file_data: reader.result })
								}, false)
							} else
								this.setState({ file: event.target.value, file_data: null })
						}}
					/>
					<img src={this.state.file_data}/>
					<button disabled={isDisabled}>Submit</button>
					{this.props.children}
				</form>
			</div>
		)
	}
}