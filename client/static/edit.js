/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var UserForm = function (_React$Component) {
	_inherits(UserForm, _React$Component);

	function UserForm(props) {
		_classCallCheck(this, UserForm);

		var _this = _possibleConstructorReturn(this, (UserForm.__proto__ || Object.getPrototypeOf(UserForm)).call(this, props));

		_this.regex = {
			name: /^[a-zA-Z 0-9_\-#]{8,40}$/,
			phone: /^([0-9]{3})[- ]?([0-9]{3})[- ]?([0-9]{4})$/,
			price: /^([0-9]*)(\.[0-9]+|[0-9]*)$/
		};
		_this.state = {
			product: props.initData.product,
			contact: props.initData.contact,
			email: props.initData.email,
			price: props.initData.price,
			file: props.initData.file,
			file_data: props.initData.image,
			isSubmitted: false,
			submissionResponse: {}
			// This binding is necessary to make `this` work in the callback
		};_this.submitUserData = _this.submitUserData.bind(_this);
		return _this;
	}

	_createClass(UserForm, [{
		key: 'validate',
		value: function validate() {
			// true means invalid, so our conditions got reversed
			return {
				product: !(this.state.product.length === 0 || this.regex.name.test(this.state.product)),
				contact: !(this.state.contact.length === 0 || this.regex.phone.test(this.state.contact)),
				price: !(this.state.price.length === 0 || this.regex.price.test(this.state.price) && parseFloat(this.state.price) > 0),
				file: !(this.state.file.length !== 0)
			};
		}
	}, {
		key: 'submitUserData',
		value: function submitUserData(userData, extraData) {
			Object.assign(userData, extraData);
			var that = this;
			if (that.props.saveNewInfo) $.ajax({
				type: 'POST',
				url: '/save',
				data: JSON.stringify(userData),
				contentType: 'application/json; charset=utf-8',
				dataType: 'json'
			}).done(function (data, textStatus, jqXHR) {
				that.setState({ isSubmitted: true, submissionResponse: data });
			});else $.ajax({
				type: 'POST',
				url: '/update',
				data: JSON.stringify(userData),
				contentType: 'application/json; charset=utf-8',
				dataType: 'json'
			}).done(function (data, textStatus, jqXHR) {
				that.setState({ isSubmitted: true, submissionResponse: data });
				setTimeout(function () {
					window.location.href = '/';
				}, 2000);
			});
		}
	}, {
		key: 'canBeSubmitted',
		value: function canBeSubmitted() {
			var _this2 = this;

			var errors = this.validate();
			var isDisabled = Object.keys(errors).some(function (x) {
				return errors[x];
			}) || Object.keys(errors).some(function (x) {
				return _this2.state[x].length === 0;
			});
			return !isDisabled;
		}
	}, {
		key: 'render',
		value: function render() {
			var _this3 = this;

			var errors = this.validate(),
			    isDisabled = Object.keys(errors).some(function (x) {
				return errors[x];
			}) || Object.keys(errors).some(function (x) {
				return _this3.state[x].length === 0;
			});

			var shouldMarkError = function shouldMarkError(field) {
				var hasError = errors[field];
				return hasError;
			};

			var response = this.state.submissionResponse;

			var responseDOM = null;

			if (response['success']) {
				if (this.props.saveNewInfo) {
					addItem(response['success']);
					setTimeout(function () {
						_this3.props.closeModal();
					}, 1000);
				} else {
					responseDOM = React.createElement(
						'p',
						null,
						response['success']
					);
					setTimeout(function () {
						window.location.href = '/';
					}, 2000);
				}
			} else responseDOM = React.createElement(
				'p',
				null,
				response['failure'] ? response['failure'] : ''
			);

			return React.createElement(
				'div',
				{ id: 'user-form' },
				React.createElement(
					'div',
					{ className: this.state.isSubmitted ? 'submission-status show' : 'submission-status hidden' },
					React.createElement(
						'h3',
						null,
						this.state.submissionResponse['success'] ? 'Success' : 'Failure'
					),
					responseDOM
				),
				React.createElement(
					'form',
					{ className: this.state.isSubmitted ? 'hide' : '', onSubmit: function onSubmit(e) {
							e.preventDefault();
							if (!_this3.canBeSubmitted()) return;
							_this3.submitUserData(_this3.state, _this3.props.extraData);
						} },
					React.createElement('input', {
						className: shouldMarkError('product') ? 'error' : '',
						type: 'text',
						placeholder: 'Product Name (min 8 chars)',
						value: this.state.product,
						onChange: function onChange(e) {
							return _this3.setState({ product: e.target.value });
						}
					}),
					React.createElement('input', {
						type: 'text',
						value: this.state.email,
						disabled: true
					}),
					React.createElement('input', {
						className: shouldMarkError('contact') ? 'error' : '',
						type: 'text',
						placeholder: '10 Digit Contact Number',
						value: this.state.contact,
						onChange: function onChange(e) {
							return _this3.setState({ contact: e.target.value });
						}
					}),
					React.createElement('input', {
						className: shouldMarkError('price') ? 'error' : '',
						type: 'text',
						placeholder: 'Selling price in $',
						value: this.state.price,
						onChange: function onChange(e) {
							return _this3.setState({ price: e.target.value });
						}
					}),
					React.createElement('input', {
						type: 'file',
						accept: 'image/*',
						value: this.state.file,
						onChange: function onChange(event) {
							if (event.target.value !== '' && event.target.files[0].size > 2000000) {
								alert('File size can NOT be more than 2MB');
								_this3.setState({ file: '', file_data: null });
								return;
							}
							if (event.target.value !== '') {
								var reader = new FileReader(),
								    that = _this3;
								reader.readAsDataURL(event.target.files[0]);
								_this3.setState({ file: event.target.value });
								reader.addEventListener('load', function () {
									that.setState({ file_data: reader.result });
								}, false);
							} else _this3.setState({ file: event.target.value, file_data: null });
						}
					}),
					React.createElement('img', { src: this.state.file_data }),
					React.createElement(
						'button',
						{ disabled: isDisabled },
						'Submit'
					),
					this.props.children
				)
			);
		}
	}]);

	return UserForm;
}(React.Component);

exports.default = UserForm;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _form = __webpack_require__(0);

var _form2 = _interopRequireDefault(_form);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var EditForm = function (_React$Component) {
	_inherits(EditForm, _React$Component);

	function EditForm() {
		_classCallCheck(this, EditForm);

		var _this = _possibleConstructorReturn(this, (EditForm.__proto__ || Object.getPrototypeOf(EditForm)).call(this));

		_this.state = {
			showForm: true,
			responseMessage: {}
		};
		return _this;
	}

	_createClass(EditForm, [{
		key: 'handleRemove',
		value: function handleRemove(e) {
			e.preventDefault();
			var that = this;
			if (confirm('Are you sure ?')) {
				$.ajax({
					type: 'POST',
					url: '/delete',
					data: JSON.stringify({ id: this.props.data['_id'] }),
					contentType: 'application/json; charset=utf-8',
					dataType: 'json'
				}).done(function (data, textStatus, jqXHR) {
					that.setState({ showForm: false, responseMessage: data });
					setTimeout(function () {
						window.location.href = '/';
					}, 2000);
				});
			}
		}
	}, {
		key: 'render',
		value: function render() {
			var _this2 = this;

			var userInfo = {
				product: this.props.data.product,
				contact: this.props.data.contact,
				email: this.props.data.email,
				price: this.props.data.price,
				image: this.props.data.image,
				file: this.props.data.image_name
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
			};

			var response = this.state.responseMessage,
			    responseDOM = null;

			if (this.state.showForm) responseDOM = React.createElement(
				'div',
				null,
				React.createElement(
					_form2.default,
					{ saveNewInfo: false, initData: userInfo, extraData: mapInfo },
					React.createElement(
						'button',
						{ className: 'removeBtn', onClick: function onClick(e) {
								return _this2.handleRemove(e);
							} },
						'Delete'
					)
				)
			);else responseDOM = React.createElement(
				'div',
				{ style: { textAlign: 'center' } },
				React.createElement(
					'h3',
					null,
					response['success'] ? 'Success' : 'Failure'
				),
				React.createElement(
					'p',
					null,
					response['success'] ? response['success'] : response['failure']
				)
			);

			return responseDOM;
		}
	}]);

	return EditForm;
}(React.Component);

ReactDOM.render(React.createElement(EditForm, { data: userData }), document.getElementById('edit'));

/***/ })
/******/ ]);