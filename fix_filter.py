#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import re

# Read the file
with open('app/superadmin/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Simple regex to find and replace the filter section
# Look for the filter function and replace it
pattern = r'\.filter\(\(donation\) => \{\s+if \(!donation\.date\) return false;.*?return true;\s+\}\)'

replacement = r'''.filter((donation) => {
                          if (!donation.date) return true;
                          
                          const dateStr = donation.date;
                          const numbers = dateStr.match(/\d+/g) || [];
                          const day = numbers[0] || '';
                          const year = numbers[1] || '';
                          
                          if (filterYear && year !== filterYear) return false;
                          if (filterDay && day !== filterDay) return false;
                          
                          if (filterMonth) {
                            const months = {
                              'January': ['January', 'জানুয়ারি'],
                              'February': ['February', 'ফেব্রুয়ারি'],
                              'March': ['March', 'মার্চ'],
                              'April': ['April', 'এপ্রিল'],
                              'May': ['May', 'মে'],
                              'June': ['June', 'জুন'],
                              'July': ['July', 'জুলাই'],
                              'August': ['August', 'আগস্ট'],
                              'September': ['September', 'সেপ্টেম্বর'],
                              'October': ['October', 'অক্টোবর'],
                              'November': ['November', 'নভেম্বর'],
                              'December': ['December', 'ডিসেম্বর']
                            };
                            if (!months[filterMonth]?.some(m => dateStr.includes(m))) {
                              return false;
                            }
                          }
                          
                          return true;
                        })'''

# Try regex replacement with DOTALL flag
new_content = re.sub(pattern, lambda m: replacement, content, flags=re.DOTALL)

# If that didn't work, try a more manual approach
if new_content == content:
    print("Regex didn't match, trying manual approach...")
    # Find the start of the filter function
    start_idx = content.find(".filter((donation) => {")
    if start_idx != -1:
        # Find the end of the filter function (the closing }))
        # We need to find the matching braces
        brace_count = 0
        in_filter = False
        end_idx = start_idx
        for i in range(start_idx, len(content)):
            if content[i] == '{':
                brace_count += 1
                in_filter = True
            elif content[i] == '}' and in_filter:
                brace_count -= 1
                if brace_count == 0:
                    end_idx = i + 1
                    break
        
        if end_idx > start_idx:
            # Replace the section
            new_content = content[:start_idx] + replacement.strip() + content[end_idx:]
            print(f"Found and replaced filter from {start_idx} to {end_idx}")
        else:
            print("Could not find the end of the filter function")
    else:
        print("Could not find filter start")
else:
    print("Regex replacement successful")

# Write the file back
with open('app/superadmin/page.tsx', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("File updated successfully")
