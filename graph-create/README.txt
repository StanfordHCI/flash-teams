Graph creator (beta):
 - Run with: "ruby blocksMap.rb [./data/filename.tsv] > [vizfile.gv] 2> results.log"
  -- The .gv file will be readable by GraphViz; the results.log file will have a more readable version of the parsed tasks
 - You can get GraphViz from: http://www.graphviz.org/
 - NOTE: Still uses a 'cleaned' version of the .tsv file output by Google Docs until formatting in the doc can be reconciled
 - Suggestion: create a /local/ dir (already marked in .gitignore) to output the result files to. Helps keep the repo clean


STRIPS creator (alpha)
 - WARNING: Needs parsing updates. Stay tuned for further details.
 - Run with "ruby strips4blocks.rb [./data/filename.tsv] [./local/outfile.strips]"
