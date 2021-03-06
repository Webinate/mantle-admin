﻿module clientAdmin
{
	/**
	* Controller for the login HTML
	*/
	export class LoginCtrl
	{
		private http: ng.IHttpService;
        private q: ng.IQService;
        private loginToken: { username: string; rememberMe: boolean; password: string; };
		private error: boolean;
        private errorMsg: string;
        private usersURL: string;
        private loading: boolean;
        private _state: ng.ui.IStateService;

		// $inject annotation.
        public static $inject = ["$http", "$q", "usersURL", "$state"];
        constructor(http: ng.IHttpService, q: ng.IQService, usersURL: string, state: ng.ui.IStateService)
		{
			this.http = http;
            this.q = q;
            this.usersURL = usersURL;
            this._state = state;

			// Create the login token
			this.loginToken = {
				username: "",
				password: "",
				rememberMe: true
			};

            this.loading = false;
			this.error = false;
			this.errorMsg = "Hello";
		}

		/**
		 * Call this function to send the user password reset instructions
		 */
		forgotPassword()
		{
			var that = this;
			var token = this.loginToken;
            var host = this.usersURL;

			if ( !token.username || token.username == "" )
			{
				this.error = true;
            	this.errorMsg = "Please enter your email or username";
				return
			}

            this.error = false;
            this.errorMsg = "";
            this.loading = true;

            this.http.get<Modepress.IResponse>(`${host}/users/${token.username}/request-password-reset`, token).then(function (response)
			{
				var responseToken = response.data;
				that.error = true;
				that.errorMsg = responseToken.message;
                that.loading = false;

			}).catch( function(err)
			{
                that.error = true;
                that.loading = false;
				that.errorMsg = "Could not communicate with server";
			});
		}

		/**
		* Attempts to log the user in
		*/
		logIn()
		{
			var that = this;
			var token = this.loginToken;
            var host = this.usersURL;

            this.error = false;
            this.errorMsg = "";
            this.loading = true;

            this.http.post<Modepress.IAuthenticationResponse>(`${host}/auth/login`, token).then(function (response)
			{
                var responseToken = response.data;
				if (responseToken.error)
				{
					that.error = true;
					that.errorMsg = responseToken.message;
				}
				else
                    that._state.go("default");

                that.loading = false;

			}).catch( function(err)
			{
                that.error = true;
                that.loading = false;
				that.errorMsg = "Could not communicate with server";
			});
		}
	}
}