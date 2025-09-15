import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PatientList } from './patient-list/patient-list.component';
import { PatientForm } from './patient-form/patient-form.component';

const routes: Routes = [
  { path: '', component: PatientList },
  { path: 'new', component: PatientForm },
  { path: ':id/edit', component: PatientForm }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PatientsRoutingModule { }
