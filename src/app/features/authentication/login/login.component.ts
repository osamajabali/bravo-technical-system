import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { finalize } from 'rxjs';
import { LogIn } from '../../../core/models/login/login.model';
import { LoginService } from '../../../core/services/login-services/login.service';

@Component({
	selector: 'app-login',
	standalone: true,
	imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
	templateUrl: './login.component.html',
	styleUrl: './login.component.scss'
})
export class LoginComponent {
	user: LogIn = new LogIn();
	router = inject(Router);
	loginService = inject(LoginService);
	showPassword: boolean;
	isSubmitting: boolean =false;

	onSubmit(loginForm: NgForm): void {

		if (loginForm.invalid) {
			return
		}
		this.isSubmitting = true;
		this.loginService.login(this.user).pipe(
			finalize(() => { })
		).subscribe(response => {
			if (response.success) {
				this.isSubmitting = false;
				this.loginService.setUser(response.data.token);
				localStorage.setItem('userName', response.data.fullName);
				this.router.navigate(['/features'])
			}
			else {
				this.isSubmitting = false;
				console.log('WRONG_EMAIL_OR_PASSWORD')
			}
		}
		)
	}


	togglePassword() {
		this.showPassword = !this.showPassword;
	}
}
