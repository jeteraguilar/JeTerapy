import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { PatientList } from './features/patients/patient-list/patient-list.component';
import { PatientForm } from './features/patients/patient-form/patient-form.component';
import { AppointmentListComponent } from './features/appointments/appointment-list/appointment-list.component';
import { AppointmentForm } from './features/appointments/appointment-form/appointment-form.component';
import { PaymentListComponent } from './features/payments/payment-list/payment-list.component';
import { PaymentFormComponent } from './features/payments/payment-form/payment-form.component';
import { AuthGuard } from './core/guards/auth.guard';
import { MenuComponent } from './features/menu/menu.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'menu', component: MenuComponent, canActivate: [AuthGuard] },
  { path: 'patients', component: PatientList, canActivate: [AuthGuard] },
  { path: 'patients/new', component: PatientForm, canActivate: [AuthGuard] },
  { path: 'patients/:id/edit', component: PatientForm, canActivate: [AuthGuard] },
  { path: 'appointments', component: AppointmentListComponent, canActivate: [AuthGuard] },
  { path: 'appointments/new', component: AppointmentForm, canActivate: [AuthGuard] },
  { path: 'appointments/:id/edit', component: AppointmentForm, canActivate: [AuthGuard] },
  { path: 'payments', component: PaymentListComponent, canActivate: [AuthGuard] },
  { path: 'payments/new', component: PaymentFormComponent, canActivate: [AuthGuard] },
  { path: 'payments/:id/edit', component: PaymentFormComponent, canActivate: [AuthGuard] },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' }
];
