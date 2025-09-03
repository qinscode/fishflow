# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands
- `npm start` - Start Expo development server
- `npm run ios` - Run on iOS simulator  
- `npm run android` - Run on Android emulator
- `npm run web` - Run in web browser
- `npm run lint` - Run ESLint checks
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run type-check` - Run TypeScript type checking
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Platform-Specific
- Use `npx expo start --clear` if encountering cache issues
- Use `npx expo run:ios` for native iOS builds

## Architecture Overview

### Tech Stack
- **Framework**: Expo SDK 53 + React Native 0.79.6
- **Language**: TypeScript 5.8
- **State Management**: Zustand (`lib/store.ts`)
- **Database**: SQLite with expo-sqlite (`lib/database.ts`)
- **Navigation**: Expo Router with typed routes
- **Animations**: React Native Reanimated 3
- **Forms**: React Hook Form + Zod validation

### Core Data Flow
1. **State Management**: Centralized Zustand store in `lib/store.ts` with separate selectors and actions
2. **Database Layer**: `DatabaseService` singleton in `lib/database.ts` handles SQLite operations
3. **Type System**: Comprehensive TypeScript types defined in `lib/types.ts`
4. **UI Components**: Modular component library in `components/` with animations and theming

### Key Data Models
- **Fish**: Species data with habitat, characteristics, regulations, and rarity
- **CatchRecord**: Fishing logs with photos, measurements, location, and equipment
- **Achievement**: Tiered achievement system (bronze/silver/gold) with progress tracking
- **EquipmentSet**: Fishing gear combinations with rod, reel, line, hook, bait, and water type compatibility
- **EquipmentItem**: Individual equipment items with specifications and categories
- **EquipmentStats**: Usage statistics and success rates for equipment combinations
- **UserProfile**: User data and preferences with privacy settings

### App Structure
- **Home**: Statistics overview, quick actions, recent catches
- **Fishdex**: Pokemon-style fish collection with locked/unlocked states
- **Log**: Fishing record creation with camera, location, and measurements
- **Equipment**: Fishing gear management with set creation, editing, and usage tracking
- **Achievements**: Progress tracking and badge display
- **Stats**: Data visualization and analytics

### State Management Patterns
- Use selector hooks (`useFish`, `useCatches`, `useEquipmentSets`, etc.) for data access
- Cache filtering results to prevent unnecessary re-computations
- Track unlocked fish IDs in a Set for O(1) lookup performance
- Reset cached data when underlying data changes

### Database Conventions
- Use `DatabaseService.getInstance()` for all database operations
- All JSON data is stringified for SQLite storage
- Use snake_case for database columns, camelCase for TypeScript
- Implement proper error handling and logging

### UI Component Guidelines
- `FishCard`: Supports multiple states (locked/unlocked/new) and sizes
- Animation components in `components/animations/` for consistent transitions
- UI components in `components/ui/` follow design system patterns
- Use `ThemedView` and `ThemedText` for consistent theming

### Performance Considerations
- Use `@shopify/flash-list` instead of FlatList for large lists
- Cache filtered results in Zustand store to prevent re-filtering
- Lazy load images and use Expo Image for optimization
- Use React Native Reanimated for 60fps animations

## Development Notes

### Data Import
- Fish data can be imported using scripts in `scripts/` directory
- Australian fish data is available in `lib/australianFishData.ts`
- Use `DatabaseService.insertManyFish()` for bulk operations

### Adding New Features
- Follow existing patterns in `lib/types.ts` for new data models
- Add database migrations in `DatabaseService.createTables()`
- Update Zustand store with new actions and selectors
- Create UI components following existing design patterns

### Testing
- No specific test framework is currently configured
- Manual testing should cover all platforms (iOS, Android, Web)
- Test database operations and state management thoroughly