#! /bin/ruby

# PARAMS
@UseMultiLink = false

# VARS
isLite = false
isHighlevel = false

# Track the existing connections
#   Format: Label, From, To, Count
@ConnectionArray = Array.new

# Color set -- MUST be at least as large as the number of possible tasks
colorArray = ["darkgoldenrod2", "cornflowerblue", "gray45", "deeppink", "darkolivegreen", "darksalmon", "darkorchid", "burlywood", "red", "blue", "green", "yellow", "pink"]

# Process command line arguments
if( ARGV.length > 0 )
	ARGV.each{ |param|
		# Clean up the input
		param = param.downcase.gsub(/[-_]/,"")

		if( param == "lite" )
			# If we want the single-node versus ternary form visualization of tasks...
			isLite = true
		elsif( param == "highlevel" )
			# If we only want a job-level visualization...
			isHighlevel = true
		end
	}
end

#FUNCS

def addConnection(inLabel, inFrom, inTo, inCount)
	toAdd = Array.new
	toAdd[0] = inLabel
	toAdd[1] = inFrom
	toAdd[2] = inTo
	toAdd[3] = inCount

	if( !@UseMultiLink )
		# If we want to weight edges, we need to each for existing (matching) links
		matchFound = false
		for i in 0...@ConnectionArray.length
			cur = @ConnectionArray[i]
			if( cur[0] == inLabel && cur[1] == inFrom && cur[2] == inTo )
				# If we find a match, add one to the edge count
				cur[3] += inCount
				matchFound = true
				return
			end
		end

	end

	# Otherwise, just add the edge
	@ConnectionArray << toAdd
end

def getConnections()
	retStr = ""
	for i in 0...@ConnectionArray.length
		cur = @ConnectionArray[i]
		if( @UseMultiLink )
			retStr = "#{retStr}#{cur[1]}->#{cur[2]}	[label=\"#{cur[0]}\", color=green]\n"
		else
			retStr = "#{retStr}#{cur[1]}->#{cur[2]}	[label=\"#{cur[0]}\", color=green, penwidth=#{cur[3]}]\n"
		end
	end

	return retStr
end

def printElem(elem)
	$stderr.puts("\nName: #{elem["name"]}")
	$stderr.puts("Input: #{elem["input"].join("; ")}")
	$stderr.puts("Output: #{elem["output"].join("; ")}")
	$stderr.puts("Descr: #{elem["description"]}")
	$stderr.puts("Tasks: #{elem["jobtags"].join("-")}")
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
jobNameArray = Array.new
gContent = ""
gLinks = ""
taskNameOffset = 8

lineIdx = -1
file.each{ |line|
	# Clean up the input
	line = line.downcase.gsub(/[^a-zA-Z0-9;,\/\\\- \t]/,"")

	# Split the input into fields / columns
	lineAry = line.split("\t")

	lineIdx += 1
	if( lineIdx == 0 )
		# Read the titles from the first line...

		for i in taskNameOffset...lineAry.length
			# As long as there is a name
			if( lineAry[i] != "" )
				jobNameArray << lineAry[i].gsub(" ", "_")
			end
		end

		# Skip the rest of the loop for now, there is nothing else to add
		next
	end

	toAdd = Hash.new

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
	toAdd["jobtags"] = taskAry

	# Debug output / sanity check of the parse
	printElem(toAdd)

	# Add the newly populated element
	blockArray << toAdd
}


## NODES ##

# Add the names of all the nodes we're going to use in the graph
if( !isHighlevel )
	# In the normal case, we want to add all task names...
	blockArray.each{ |elem|
		# If we want the ternary form output, add Pre- and Post- condition nodes to each task
		if( !isLite )
			gContent = "#{gContent}pre#{elem["name"]}	[label=\"[ #{elem["name"]} ]\n#{elem["input"].join("; ")}\", fillcolor=red]\n"
			gContent = "#{gContent}post#{elem["name"]}	[label=\"[ #{elem["name"]} ]\n#{elem["output"].join("; ")}\", fillcolor=grey]\n"
		end
	
		# Get the color for the node based on the task marked
		selColor = "black"  # Set a default color
		for i in 0...elem["jobtags"].length
			# If this task is part of the current job
			if( elem["jobtags"][i] == "1" )
				selColor = colorArray[i]
				break
			end
		end

		# Now, add the main task node itself
		gContent = "#{gContent}#{elem["name"]}	[label=\"[ #{elem["name"]} ]\n#{elem["description"]}\", fillcolor=#{selColor}]\n"
	}
else
	#For the highlevel case, we only need to add job names
	for i in 0...jobNameArray.length
		job = jobNameArray[i]
		selColor = colorArray[i]
		gContent = "#{gContent}#{job}	[label=\"#{job}\", fillcolor=#{selColor}]\n"
	end
end


## LINKS ##

# Add the basic links between sets of task components (only needed if using the ternary representaion)
if( !isLite && !isHighlevel )
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
				# If there is a match between a post condition and a precondition...
				if( outE == inE )
					if( !isHighlevel )
						# In the normal case, add connections between nodes
						if( !isLite )
							gLinks = "#{gLinks}post#{elem["name"]}->pre#{innerElem["name"]}	[label=\"#{outE}\", color=green]\n"
						else
							gLinks = "#{gLinks}#{elem["name"]}->#{innerElem["name"]}	[label=\"#{outE}\", color=green]\n"
						end
					else
						# For highlevel, find the job that the tasks each element belongs to and add a connection between them
						outerJobIdxAry = Array.new
						for i in 0...elem["jobtags"].length
							tag = elem["jobtags"][i]
							if( tag == "1" )
								outerJobIdxAry << i
							end
						end

						innerJobIdxAry = Array.new
						for i in 0...innerElem["jobtags"].length
							tag = innerElem["jobtags"][i]
							if( tag == "1" )
								innerJobIdxAry << i
							end
						end

						# Now add the links
						outerJobIdxAry.each{ |ojIdx|
							innerJobIdxAry.each{ |ijIdx|
								if( ojIdx != ijIdx )
									#gLinks = "#{gLinks}#{jobNameArray[ojIdx]}->#{jobNameArray[ijIdx]}	[label=\"#{outE}\", color=green]\n"
									addConnection(outE, jobNameArray[ojIdx], jobNameArray[ijIdx], 1)
								end
							}
						}
					end
				end
			}
		}
	}
}

gLinks += getConnections()

printGraph(gContent + gLinks)

#puts("Done.")
