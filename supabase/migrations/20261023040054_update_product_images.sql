/*
# Update product image URLs with real photos

## Overview
Updates the `image_url` column for all seeded products to use real, category-appropriate 
stock photos from Pexels. No schema changes — only data updates.

## Changes
- Updated `image_url` for all 12 products to match their actual product type.
*/

UPDATE products SET image_url = 'https://images.pexels.com/photos/35109272/pexels-photo-35109272.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Cassava';
UPDATE products SET image_url = 'https://images.pexels.com/photos/13788549/pexels-photo-13788549.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Local Rice (Swamp)';
UPDATE products SET image_url = 'https://images.pexels.com/photos/31448423/pexels-photo-31448423.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Red Palm Oil';
UPDATE products SET image_url = 'https://images.pexels.com/photos/19689774/pexels-photo-19689774.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Hot Pepper (Bird Eye)';
UPDATE products SET image_url = 'https://images.pexels.com/photos/7456548/pexels-photo-7456548.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Sweet Potatoes';
UPDATE products SET image_url = 'https://images.pexels.com/photos/8352786/pexels-photo-8352786.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Fresh Fish (Tilapia)';
UPDATE products SET image_url = 'https://images.pexels.com/photos/30543146/pexels-photo-30543146.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Bananas';
UPDATE products SET image_url = 'https://images.pexels.com/photos/28930670/pexels-photo-28930670.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Bitter Balls (Garden Eggs)';
UPDATE products SET image_url = 'https://images.pexels.com/photos/209345/pexels-photo-209345.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Groundnuts (Peanuts)';
UPDATE products SET image_url = 'https://images.pexels.com/photos/39049842/pexels-photo-39049842.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Plantains';
UPDATE products SET image_url = 'https://images.pexels.com/photos/39490207/pexels-photo-39490207.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Fresh Okra';
UPDATE products SET image_url = 'https://images.pexels.com/photos/4921856/pexels-photo-4921856.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Local Honey';
