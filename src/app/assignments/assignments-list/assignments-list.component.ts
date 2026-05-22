import { Component, signal, computed } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Assignment {
  id: string;
  name: string;
  licenseNumber: string;
  plateNumber: string;
}

@Component({
  selector: 'app-assignments-list',
  standalone: true,
  imports: [MatIconModule, RouterLink, FormsModule],
  templateUrl: './assignments-list.component.html',
  styleUrl: './assignments-list.component.scss'
})
export class AssignmentsListComponent {
  isLoading = signal(false);
  searchQuery = signal('');
  
  dummyAssignments: Assignment[] = [
    { id: '1', name: 'John Doe', licenseNumber: 'DL-12345', plateNumber: 'ABC-123' },
    { id: '2', name: 'Jane Smith', licenseNumber: 'DL-67890', plateNumber: 'XYZ-987' },
    { id: '3', name: 'Bob Johnson', licenseNumber: 'DL-45678', plateNumber: 'LMN-456' },
  ];

  assignments = computed(() => {
    const query = this.searchQuery().toLowerCase();
    return this.dummyAssignments.filter(a => 
      a.name.toLowerCase().includes(query) ||
      a.licenseNumber.toLowerCase().includes(query) ||
      a.plateNumber.toLowerCase().includes(query)
    );
  });
}
