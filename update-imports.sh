#!/bin/bash

# Function to process files
update_imports() {
    local file=$1
    
    # Update component imports
    sed -i '' 's|from "@/button"|from "@components/button"|g' "$file"
    sed -i '' 's|from "@/components/button"|from "@components/button"|g' "$file"
    
    # Update other common component imports
    sed -i '' 's|from "@/progress"|from "@components/progress"|g' "$file"
    sed -i '' 's|from "@/components/progress"|from "@components/progress"|g' "$file"
    
    # Update utility imports
    sed -i '' 's|from "@/lib/utils"|from "@lib/utils"|g' "$file"
    
    # Update internal component imports if they exist
    sed -i '' 's|from "@/components/ui/button"|from "@components/__internal/button"|g' "$file"
    sed -i '' 's|from "@/components/ui/progress"|from "@components/__internal/progress"|g' "$file"
    
    # Update relative imports to use aliases
    sed -i '' 's|from "\.\./\.\./components/|from "@components/|g' "$file"
    sed -i '' 's|from "\.\.\/components\/|from "@components/|g' "$file"
    sed -i '' 's|from "\.\./|from "@/|g' "$file"
}

# Find all TypeScript and JavaScript files
find src -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) | while read -r file; do
    update_imports "$file"
done