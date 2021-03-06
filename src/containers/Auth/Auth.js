import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import * as actions from '../../store/actions/index';
import Input from '../../components/UI/Input/Input';
import Button from '../../components/UI/Button/Button';
import Spinner from '../../components/UI/Spinner/Spinner';
import Aux from '../../hoc/Auxiliary/Auxiliary';
import classes from './Auth.css';
import { validate, updateObject } from '../../shared/utility';

class Auth extends Component {
    state = {
        controls: {
            email: {
                elemType: 'input',
                elemConfig: {
                    type: 'email',
                    name: 'email',
                    placeholder: 'Email',
                    value: ''
                },
                validation: {
                    required: true,
                    isEmail: true
                },
                isValid: false,
                touched: false
            },
            password: {
                elemType: 'input',
                elemConfig: {
                    type: 'password',
                    name: 'password',
                    placeholder: 'Password',
                    value: ''
                },
                validation: {
                    required: true,
                    minLength: 6
                },
                isValid: false,
                touched: false,
                invalidString: 'Password must be at least 6 digits long'
            },
        },
        isSignUp: true
    }

    componentDidMount() {
        if (!this.props.isBuilding && this.props.authRedirect === '/checkout') {
            this.props.setAuthRedirect('/');
        }
    }

    inputChangeHandler = (event, elem) => {
        const newControls = updateObject(this.state.controls, {
            [elem]: updateObject(this.state.controls[elem], {
                elemConfig: updateObject(this.state.controls[elem].elemConfig, {
                    value: event.target.value
                }),
                touched: true,
                isValid: validate(event.target.value, this.state.controls[elem].validation)
            })
        });

        this.setState({controls: newControls});
    }

    authHandler = (event) => {
        event.preventDefault();
        this.props.onAuth(
            this.state.controls.email.elemConfig.value,
            this.state.controls.password.elemConfig.value,
            this.state.isSignUp
        );
    }

    switchModeHandler = () => {
        this.setState(prevState => ({isSignUp: !prevState.isSignUp}));
    }

    render() {
        const formElemsArray = [];
        for (let elem in this.state.controls) {
            const cur = this.state.controls[elem];
            formElemsArray.push({
                key: elem,
                type: cur.elemType,
                config: cur.elemConfig,
                valid: cur.validation ? !cur.touched || cur.isValid : true,
                invalidString: cur.invalidString
            });
        }

        let err = null;
        if (this.props.error) {
            err = <p className={classes.Error}>{this.props.error.message}</p>
        }

        let redirect = null;
        if (this.props.isAuthenticated) {
            redirect = <Redirect to={this.props.authRedirect} />;
            
        }

        let form = (
            <Aux>
                <form onSubmit={this.authHandler}>
                    {formElemsArray.map(elem => (
                        <Input
                            key={elem.key}
                            label={elem.key}
                            inputtype={elem.type}
                            config={{ ...elem.config }}
                            change={(event) => this.inputChangeHandler(event, elem.key)}
                            valid={elem.valid}
                            invalidString={elem.invalidString} />
                    ))}
                    {err}
                    <Button btnType='Success'>{this.state.isSignUp ? 'Sign Up' : 'Login'}</Button>
                </form>
                <Button btnType='Danger' clicked={this.switchModeHandler}>
                    Switch to {this.state.isSignUp ? 'Login' : 'Sign Up'}
                </Button>
            </Aux>
        );

        if (this.props.loading) {
            form = <Spinner />;
        }

        return (
            <div className={classes.Auth}>
                {redirect}
                <h3>{this.state.isSignUp ? 'Sign Up' : 'Login'}</h3>
                {form}
            </div>
        );
    }
}

const mapStateToProps = state => ({
    error: state.auth.error,
    loading: state.auth.loading,
    isAuthenticated: state.auth.token !== null,
    isBuilding: state.burger.isBuilding,
    authRedirect: state.auth.authRedirect
});

const mapDispatchToProps = dispatch => ({
    onAuth: (email, password, isSignUp) => dispatch(actions.auth(email, password, isSignUp)),
    onSetAuthRedirect: (path) => dispatch(actions.setAuthRedirect(path))
});

export default connect(mapStateToProps, mapDispatchToProps)(Auth);