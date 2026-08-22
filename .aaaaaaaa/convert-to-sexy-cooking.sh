#!/bin/bash

# Convert Yoga Theme to Sexy Cooking Theme

echo "Converting project from Yoga theme to Sexy Cooking theme..."

find client -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.css" \) -exec sed -i '' \
  -e 's/Yoga/Sexy Cooking/g' \
  -e 's/yoga/sexy-cooking/g' \
  -e 's/YogaFlow/SexyCookingFlow/g' \
  -e 's/bg-yoga-cream/bg-sexy-cooking-cream/g' \
  -e 's/bg-yoga-brown/bg-sexy-cooking-brown/g' \
  {} +

echo "Conversion complete!"
