# Genogram - Family Creation Example

This document demonstrates how to create a family using the FamilyForm component and the genogramService.

## Features Implemented

### 1. FamilyForm Component (FamilyForm.jsx)
- Multi-step form to create families from existing church members
- Step 1: Enter family name
- Step 2: Select members from church to be part of the family
- Optional: Define relationships between family members

### 2. genogramService Functions

#### familyCreationService
- `getMembersForFamilyCreation(churchId)` - Gets list of church members available for family creation
- `createFamily(churchId, name, rootPersonId, description)` - Creates a new family document

#### familyService
- `createFamily()` - Creates a family in Firestore
- `getFamiliesByChurch(churchId)` - Retrieves all families for a church
- `updateFamily()` - Updates family information
- `deleteFamily()` - Deletes a family

#### genogramService
- `addPerson(familyId, memberId, firstName, lastName, gender)` - Adds a person to the genogram
- `createFamilyFromMembers(churchId, familyName, memberIds, autoDetectRelationships)` - Creates family and adds selected members

### 3. FamilyDashboard Component
- Visualizes family tree using React Flow
- Displays family members and their relationships
- Uses ReactFlow for interactive visualization

## Database Structure

### Firestore Collections
- `iglesias/{churchId}/families/` - Stores family documents
- `genogramPersons/` - Stores individual persons in families
- `genogramRelationships/` - Stores relationships between family members

### Family Document Structure
```javascript
{
  name: "Family Name",
  churchId: "church-id",
  description: "Optional description",
  rootPersonId: "first-member-id",
  memberCount: 3,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Person Document Structure
```javascript
{
  familyId: "family-id",
  memberId: "member-id-from-church",
  firstName: "John",
  lastName: "Doe",
  gender: "male",
  birthDate: "1980-01-15",
  healthConditions: [],
  role: "parent",
  notes: "Optional notes",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## How to Use

### Step 1: Navigate to Families
Go to `/membresia/genogram/families` in the application

### Step 2: Create New Family
1. Click "Create New Family" button
2. Enter family name (e.g., "Rodriguez Family")
3. Click "Next"

### Step 3: Select Family Members
1. Choose members from the available church members list
2. (Optional) Define relationships between members
3. Click "Create Family"

### Step 4: View Family Tree
The family tree will be displayed in the FamilyDashboard component showing the hierarchical relationships.

## Example Usage (Code)

```javascript
import { familyCreationService } from './services/genogramService';

// Create a family from church members
const createExampleFamily = async () => {
  try {
    const churchId = "church-123";
    const familyName = "Rodriguez Family";
    const memberIds = ["member-1", "member-2", "member-3"];
    
    const familyId = await familyCreationService.createFamilyFromMembers(
      churchId,
      familyName,
      memberIds,
      true // autoDetectRelationships
    );
    
    console.log("Family created successfully:", familyId);
  } catch (error) {
    console.error("Error creating family:", error);
  }
};
```

## Integration in App.jsx

The FamilyDashboard component is integrated into the main App routes:

```jsx
<Route
  path="/genogram/families"
  element={
    <ProtectedRoute>
      <FamilyDashboard />
    </ProtectedRoute>
  }
/>
```

## Technologies Used

- React 18
- Firebase/Firestore for data persistence
- React Flow for family tree visualization
- Lucide React for icons
- Dagre for graph layout

## Next Steps

1. Run the application: `npm run dev`
2. Login with your church credentials
3. Navigate to the Families section
4. Create your first family!

