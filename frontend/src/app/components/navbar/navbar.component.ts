import {Component} from '@angular/core';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {AuthService} from "../../services/auth.service";
import {NgIf} from "@angular/common";

// Clarity imports
// import { ClarityModule } from "@clr/angular";
import {ThemeToggleComponent} from "../theme-toggle/theme-toggle.component";
import {ClrDropdownModule} from "@clr/angular";

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.css',
    imports: [
        RouterLink,
        RouterLinkActive,
        NgIf,
        ThemeToggleComponent,
        ClrDropdownModule
    ]
})
export class NavbarComponent {
    userName: string;
    isAdmin: boolean;
    menuOpen: boolean = false;

    constructor(private authService: AuthService) {
        this.userName = this.authService.getUserName();
        this.isAdmin = this.authService.isAdmin();
    }

    toggleMenu(): void {
        this.menuOpen = !this.menuOpen;
    }

    logout() {
        this.authService.logout();
    }

}