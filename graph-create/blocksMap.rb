#! /bin/ruby

isLite = false
isHighlevel = false

# Color set -- MUST be at least as large as the number of possible tasks
colorArray = ["darkgoldenrod2", "cornflowerblue", "gray45", "deeppink", "darkolivegreen", "darksalmon", "darkorchid", "burlywood", "red", "blue", "green", "yellow", "pink"]

# Process command line arguments
if( ARGV.length > 0 )
	ARGV.each{ |param|
		# Clean up the input
		param = param.downcase.gsub(/[-_]/,"")

		# If we want the single-node versus ternary form visualization of tasks...
		if( param == "lite" )
			isLite = true
		end

		# If we only want a job-level visualization...
		if( param == "highlevel" )
			isHighlevel = true
		end
	}
end

def printElem(elem)
	$stderr.puts("\nName: #{elem["name"]}")
	$stderr.puts("Input: #{elem["input"].join("; ")}")
	$stderr.puts("Output: #{elem["output"].join("; ")}")
	$stderr.puts("Descr: #{elem["description"]}")
	$stderr.puts("Tasks: #{elem["tasktags"].join("-")}")
	$stderr.puts("========\n")
end

def printGraph(content)
	puts('digraph graph_example {

 /***** GLOBAL SETTINGS *****/

 graph          [rotate=0, rankdir="LR"]
 node           [color="#222222", style=filled,
                 shape=box, fontname="Trebuchet MS"]
 edge           [color="#66FF66", arrowhead="open", 
                 fontname="Trebuchet MS", fontsize="11"]
 node           [fillcolor="#253987", fontcolor="white"]

/***** LINKS *****/

')


	# Write the content out
	puts(content)

	puts("}")
end


######################### ######################### #########################
#####################################  ######################################
######################### ######################### #########################

file = File.open(ARGV[0])
blockArray = Array.new
taskNameArray = Array.new
gContent = ""
gLinks = ""
taskNameOffset = 8

lineIdx = -1
file.each{ |line|
	lineIdx += 1
	if( lineIdx == 0 )
		# Read the titles from the first line
		lineAry = line.split("\t")
		for i in taskNameOffset...lineAry.length
			#
			taskNameArray << lineAry[i] 
		end

		# Skip the rest of the loop for now, there is nothing else to add
		next
	end

	toAdd = Hash.new

	# Clean up the input
	line = line.downcase.gsub(/[^a-zA-Z0-9;,\/\\\- \t]/,"")
	lineAry = line.split("\t")

	# Get the action name
	toAdd["name"] = lineAry[0].gsub(" ","_")
	# Get the preconditions
	toAdd["input"] = lineAry[2].split(/\s*;\s*/)
	toAdd["input"].each{ |elem|
		elem.gsub!(" ","_")
	}
	# Get the postconditions
	toAdd["output"] = lineAry[3].split(/\s*;\s*/)
	toAdd["output"].each{ |elem|
		elem.gsub!(" ","_")
	}
	# Get the action description
	toAdd["description"] = "#{lineAry[4]}: #{lineAry[5]}"
	# Get the job membership of the task
	numTasks = lineAry.length > 8 ? lineAry.length - 8 : 0
	taskAry = Array.new
	for i in 9..lineAry.length
		#puts("task val: #{lineAry[i]}");
		taskAry << lineAry[i]
	end
	toAdd["tasktags"] = taskAry

	# Debug output / sanity check of the parse
	printElem(toAdd)

	# Add the newly populated element
	blockArray << toAdd
}

# Add the names of all the nodes we're going to use in the graph
blockArray.each{ |elem|
	# If we want the ternary form output, add Pre- and Post- condition nodes to each task
        if( !isLite )
		gContent = "#{gContent}pre#{elem["name"]}	[label=\"[ #{elem["name"]} ]\n#{elem["input"].join("; ")}\", fillcolor=red]\n"
		gContent = "#{gContent}post#{elem["name"]}	[label=\"[ #{elem["name"]} ]\n#{elem["output"].join("; ")}\", fillcolor=grey]\n"
	end
	
	# Get the color for the node based on the task marked
	selColor = "black"  # Set a default color
	for i in 0...elem["tasktags"].length
		# If this task is part of the current job
		if( elem["tasktags"][i] == "1" )
			selColor = colorArray[i]
			break
		end
	end
	gContent = "#{gContent}#{elem["name"]}	[label=\"[ #{elem["name"]} ]\n#{elem["description"]}\", fillcolor=#{selColor}]\n"
}

# Add the basic links between sets of task components (only needed if using the ternary representaion)
if( !isLite )
	blockArray.each{ |elem|
	        gContent = "#{gContent}pre#{elem["name"]}->#{elem["name"]}       [label=\"\", color=black]\n"
	        gContent = "#{gContent}#{elem["name"]}->post#{elem["name"]}       [label=\"\", color=black]\n"
	}
end

# Add I/O links
blockArray.each{ |elem|
	elem["output"].each{ |outE|
		blockArray.each{ |innerElem|
			innerElem["input"].each{ |inE|
				#content += "#{elem["name"])}    [label=\"#{elem["description"]}\"]\n"
				if( outE == inE )
					if( !isLite )
						gLinks = "#{gLinks}post#{elem["name"]}->pre#{innerElem["name"]}	[label=\"#{outE}\", color=green]\n"
					else
						gLinks = "#{gLinks}#{elem["name"]}->#{innerElem["name"]}	[label=\"#{outE}\", color=green]\n"
					end
				end
			}
		}
	}
}

printGraph(gContent + gLinks)

#puts("Done.")
