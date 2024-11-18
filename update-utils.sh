#!/bin/bash

# Function to process files
update_imports() {
    local file=$1
    
    # Update utils imports
    sed -i '' 's|from "@/utils"|from "@lib/utils"|g' "$file"
    sed -i '' 's|from "\.\./utils"|from "@lib/utils"|g' "$file"
    sed -i '' 's|from "\.\.\/\.\.\/lib\/utils"|from "@lib/utils"|g' "$file"
    sed -i '' 's|from "\.\./lib/utils"|from "@lib/utils"|g' "$file"
    
    # Also update any similar patterns
    sed -i '' 's|from "@/lib/utils"|from "@lib/utils"|g' "$file"
}

# Find all TypeScript and JavaScript files
find src -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) | while read -r file; do
    update_imports "$file"
done
