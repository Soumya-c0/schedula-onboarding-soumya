import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Onboarding } from './onboarding.entity';
import { User } from '../user/user.entity';
import { Doctor } from '../doctor/doctor.entity';
import { Patient } from '../patient/patient.entity';

const DOCTOR_STEPS = [
  { id: 1, name: 'Upload medical license' },
  { id: 2, name: 'Add specialization details' },
  { id: 3, name: 'Set consultation hours' },
];

const PATIENT_STEPS = [
  { id: 1, name: 'Add personal information' },
  { id: 2, name: 'Provide medical history' },
  { id: 3, name: 'Select preferred doctor/specialty' },
];

@Injectable()
export class OnboardingService {
  constructor(
    @InjectRepository(Onboarding)
    private onboardingRepo: Repository<Onboarding>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    @InjectRepository(Doctor) 
    private doctorsRepo: Repository<Doctor>,
    @InjectRepository(Patient) 
    private patientsRepo: Repository<Patient>,
  ) {}

  private getStepsByRole(role: 'doctor' | 'patient') {
    return role === 'doctor' ? DOCTOR_STEPS : PATIENT_STEPS;
  }

  async updateStep(userId: string, step: number, completed: boolean) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    if(!user.isVerified) {
      throw new Error('User is not verified');
    }

    const steps = this.getStepsByRole(user.role);
    const validStep = steps.find((s) => s.id === step);
    if (!validStep) throw new Error('Invalid step for this role');

    let onboarding = await this.onboardingRepo.findOne({
      where: { user: { id: userId }, step },
    });

    if (!onboarding) {
      onboarding = this.onboardingRepo.create({ user, step, completed });
    } else {
      onboarding.completed = completed;
    }

    await this.onboardingRepo.save(onboarding);

    const totalSteps = steps.length;
    const completedSteps = (
      await this.onboardingRepo.find({ where: { user: { id: userId }, completed: true } })
    ).length;

    const progressPercent = Math.round((completedSteps / totalSteps) * 100);

    return {
      message: 'Onboarding updated successfully',
      role: user.role,
      currentStep: validStep.name,
      stepNumber: step,
      completed,
      progress: `${progressPercent}%`,
    };
  }

  async getProgress(userId: string) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    if(!user.isVerified) {
      throw new Error('User is not verified');
    }

    const steps = this.getStepsByRole(user.role);
    const onboardingRecords = await this.onboardingRepo.find({
      where: { user: { id: userId } },
    });

    const progress = steps.map((step) => ({
      step: step.name,
      completed: onboardingRecords.some((o) => o.step === step.id && o.completed),
    }));

    const completedSteps = progress.filter((p) => p.completed).length;
    const percent = Math.round((completedSteps / steps.length) * 100);

    return {
      userId,
      role: user.role,
      progressPercent: `${percent}%`,
      steps: progress,
    };
  }

  async onboardDoctor(data: { userId: string; specialization: string; experience: number }) {
  const user = await this.usersRepo.findOne({ where: { id: data.userId } });
  if (!user) throw new Error('User not found');
  if (!user.isVerified) throw new Error('User not verified');
  if (user.role !== 'doctor') throw new Error('User is not a doctor');

  const doctor = this.doctorsRepo.create({
    specialization: data.specialization,
    experience: data.experience,
    user,
  });
  await this.doctorsRepo.save(doctor);

  user.isOnboarded = true;
  await this.usersRepo.save(user);

  await this.onboardingRepo.save({
  user,
  role: 'doctor',
  status: 'completed',
  notes: `Doctor onboarded successfully with specialization: ${data.specialization}`,
});


  return {
    message: 'Doctor onboarding completed successfully',
    doctor,
  };
}

async onboardPatient(data: { userId: string; condition: string; doctorId: number }) {
  const user = await this.usersRepo.findOne({ where: { id: data.userId } });
  if (!user) throw new Error('User not found');
  if (!user.isVerified) throw new Error('User not verified');
  if (user.role !== 'patient') throw new Error('User is not a patient');

  const doctor = await this.doctorsRepo.findOne({ where: { id: data.doctorId } });
  if (!doctor) throw new Error('Assigned doctor not found');

  const patient = this.patientsRepo.create({
    condition: data.condition,
    doctor,
    user,
  });
  await this.patientsRepo.save(patient);

  user.isOnboarded = true;
  await this.usersRepo.save(user);

  await this.onboardingRepo.save({
  user,
  role: 'patient',
  status: 'completed',
  notes: `Patient onboarded successfully under doctor ID: ${data.doctorId}`,
});

  return {
    message: 'Patient onboarding completed successfully',
    patient,
  };

}


}
