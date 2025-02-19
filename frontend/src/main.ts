import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Clarity Icons
import { ClarityIcons, noteIcon, trashIcon, logoutIcon, userIcon, sunIcon, moonIcon } from "@cds/core/icon";

ClarityIcons.addIcons(noteIcon, trashIcon, logoutIcon, userIcon, sunIcon, moonIcon);

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
