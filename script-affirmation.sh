find content -type f -name '*.md' | while read -r file; do
  awk '
  BEGIN { in_notice = 0 }
  /{{% notice style="note" title="Affirmation" icon="check" %}}/ {
    in_notice = 1;
    print "> [!affirmation] Affirmation";
    next;
  }
  in_notice && /{{% \/notice %}}/ {
    in_notice = 0;
    next;
  }
  in_notice {
    print ">  " $0;
    next;
  }
  { print }
  ' "$file" > temp.md && mv temp.md "$file"
done

